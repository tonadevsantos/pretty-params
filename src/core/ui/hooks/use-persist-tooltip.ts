/**
 * Make a usePersistTooltips hook where you need to:
- Expect a closeDelay parameter. default is 300ms.
- Track the hovered state based on mouse events and focus events.
- Use a timeout to delay the state change.
- Return a `makeProps('id')` function that returns the onMouseEnter, onMouseLeave, onFocus, and onBlur props for the tooltip trigger.
- Return an checkOpen('id') and checkClose('id') function to check if a tooltip is open or closed.
- Return a handleOpen and handleClose function to control the tooltips
- Return an afterClose('id') that runs after the tooltip is closed. Maybe you'll need a type of subscriber for this.
*/
import { useCallback, useRef, useState } from "react";

type TooltipId = string;
type Subscriber = (id: TooltipId) => void;
type TooltipProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

export function usePersistTooltip(closeDelay: number = 300) {
  const [openTooltips, setOpenTooltips] = useState<Set<TooltipId>>(new Set());
  const timeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const subscribersRef = useRef<{ [key: string]: Subscriber[] }>({});

  const handleOpen = useCallback((id: TooltipId) => {
    if (timeoutRef.current[id]) {
      clearTimeout(timeoutRef.current[id]);
      delete timeoutRef.current[id];
    }
    setOpenTooltips((prev) => new Set([...prev, id]));
  }, []);

  const handleClose = useCallback(
    (id: TooltipId) => {
      timeoutRef.current[id] = setTimeout(() => {
        setOpenTooltips((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        // Notify subscribers after closing
        if (subscribersRef.current[id]) {
          subscribersRef.current[id].forEach((subscriber) => subscriber(id));
        }
      }, closeDelay);
    },
    [closeDelay],
  );

  const makeProps = useCallback(
    (id: TooltipId): TooltipProps => {
      return {
        onMouseEnter: () => handleOpen(id),
        onMouseLeave: () => handleClose(id),
        onFocus: () => handleOpen(id),
        onBlur: () => handleClose(id),
      };
    },
    [handleOpen, handleClose],
  );

  const checkOpen = useCallback(
    (id: TooltipId): boolean => {
      return openTooltips.has(id);
    },
    [openTooltips],
  );

  const checkClose = useCallback(
    (id: TooltipId): boolean => {
      return !openTooltips.has(id);
    },
    [openTooltips],
  );

  const afterClose = useCallback((id: TooltipId, subscriber: Subscriber) => {
    if (!subscribersRef.current[id]) {
      subscribersRef.current[id] = [];
    }
    subscribersRef.current[id].push(subscriber);

    // Return cleanup function
    return () => {
      subscribersRef.current[id] = subscribersRef.current[id].filter(
        (sub) => sub !== subscriber,
      );
    };
  }, []);

  return {
    makeProps,
    checkOpen,
    checkClose,
    handleOpen,
    handleClose,
    afterClose,
  };
}
