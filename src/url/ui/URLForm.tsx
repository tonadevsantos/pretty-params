import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/core/ui/form";
import { useRef, useState, ChangeEvent, useMemo } from "react";
import { listURLSearchParams } from "../domain/URL";
import { useFieldArray, useForm } from "react-hook-form";
import { Input, type InputProps } from "@/core/ui/input";
import { Button } from "@/core/ui/button";
import { Trash2, PlusCircle, Edit, Copy } from "lucide-react";
import { visitURL } from "@/url/use-cases/visit-url";

// Props is url as URL
export interface URLFormProps {
  url: URL;
}

const SIZES = {
  height: {
    form: "max-h-[25rem]",
  },
};

export function URLForm(props: URLFormProps) {
  const params = useMemo(() => listURLSearchParams(props.url), [props.url]);

  const form = useForm({
    defaultValues: { params },
  });

  const { fields, append, remove } = useFieldArray({
    name: "params",
    control: form.control,
  });

  const formContainerRef = useRef<HTMLDivElement>(null);

  const [newField, setNewField] = useState<{
    name: string;
    value: string;
  } | null>(null);

  const [editModes, setEditModes] = useState<Set<number>>(new Set());

  function setEditMode(index: number) {
    setEditModes((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  }

  function cancelEdit(index: number) {
    setEditModes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }

  function checkIsEditing(index: number) {
    return editModes.has(index);
  }

  function onShowCreateField() {
    setNewField({ name: "", value: "" });
    setTimeout(() => {
      formContainerRef.current?.scrollTo({
        top: formContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }

  function onCreateField() {
    if (newField) {
      append({ name: newField.name, value: newField.value });
      setNewField(null);
    }
  }

  function onUpdateField(index: number) {
    cancelEdit(index);
  }

  function onCancelCreation() {
    setNewField(null);
  }

  function onSubmit(values: { params: Record<string, string>[] }) {
    const newURL = new URL(`${props.url.origin}${props.url.pathname}`);

    values.params.forEach(({ name, value }) => {
      newURL.searchParams.set(name, value);
    });

    const newFieldName = newField?.name.trim();
    const newFieldValue = newField?.value.trim();
    if (newFieldName && newFieldValue) {
      newURL.searchParams.set(newFieldName, newFieldValue);
    }

    onCreateField();
    visitURL(newURL.href);
  }

  function onKeydownSubmit(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && event.metaKey) {
      form.handleSubmit(onSubmit)();
    }
  }

  const onFieldChange =
    (name: "name" | "value") => (event: ChangeEvent<HTMLInputElement>) => {
      setNewField((field) => {
        if (field) {
          return { ...field, [name]: event.target.value };
        }

        return field;
      });
    };

  const inputNameProps: InputProps = {
    value: newField?.name,
    onChange: onFieldChange("name"),
    placeholder: "Set query string name",
  };

  const inputValueProps: InputProps = {
    value: newField?.value,
    onChange: onFieldChange("value"),
    placeholder: "Set query string value or do it later",
  };

  const createButtonText = "Create field";

  const disableCreateButton = newField?.name.trim() === "";

  const createButtonVariant = newField?.name ? "default" : "secondary";

  const inputLabelSize =
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={onKeydownSubmit}>
        <div
          ref={formContainerRef}
          className={`${SIZES.height.form} overflow-auto mb-4 pr-4`}
        >
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              name={`params.${index}.value`}
              render={() => {
                const isEditing = checkIsEditing(index);
                const label = form.getValues(`params.${index}.name`);
                const value = form.getValues(`params.${index}.value`);

                const handleCopyClick = () => {
                  navigator.clipboard.writeText(value);
                };

                return (
                  <FormItem className="mt-2 group">
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <FormControl>
                          <Input
                            className={inputLabelSize}
                            {...form.register(`params.${index}.name`)}
                          />
                        </FormControl>
                      ) : (
                        <FormLabel>{label}</FormLabel>
                      )}
                    </div>
                    <div className="relative group">
                      <FormControl>
                        <Input
                          className="peer focus-visible:pr-0 peer/copy-focus:pr-9 pr-9"
                          {...form.register(`params.${index}.value`)}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        size="icon"
                        className="peer/copy absolute right-0 top-1/2 -translate-y-1/2  peer-focus:opacity-0 opacity-100 transition-opacity duration-200"
                        variant="link"
                        onClick={handleCopyClick}
                      >
                        <Copy className="bg-background" />
                      </Button>
                    </div>
                    <div className="flex justify-end gap-1 transition-opacity">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelEdit(index)}
                          >
                            Cancel Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            type="button"
                            onClick={() => onUpdateField(index)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost-destructive"
                            type="button"
                            onClick={() => remove(index)}
                          >
                            <Trash2 />
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            onClick={() => setEditMode(index)}
                          >
                            <Edit />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </FormItem>
                );
              }}
            />
          ))}

          {newField ? (
            <FormItem className="mt-1 relative h-32">
              <FormControl>
                <Input className={inputLabelSize} {...inputNameProps} />
              </FormControl>
              <FormControl>
                <Input {...inputValueProps} />
              </FormControl>
              <div className="flex absolute right-0 gap-1">
                <Button variant="destructive" onClick={onCancelCreation}>
                  Cancel
                </Button>
                <Button
                  variant={createButtonVariant}
                  disabled={disableCreateButton}
                  onClick={onCreateField}
                >
                  {createButtonText}
                </Button>
              </div>
            </FormItem>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit">Visit URL</Button>
          <Button type="button" variant="secondary" onClick={onShowCreateField}>
            <PlusCircle size={16} />
            New Field
          </Button>
        </div>
      </form>
    </Form>
  );
}
