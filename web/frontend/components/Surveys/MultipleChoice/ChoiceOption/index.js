import { Icon, InlineError, Text, TextField } from "@shopify/polaris";
import { CirclePlusMinor, DeleteMinor, DragHandleMinor } from "@shopify/polaris-icons";
import { useCallback, useRef, useState } from "react";
import styles from "./ChoiceOption.module.css";

export function ChoiceOption({ title, min, max, required, choices, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const dragContainerRef = useRef();

  const detectLeftButton = useCallback((e) => {
    e = e || window.event;
    if ("buttons" in e) {
      return e.buttons === 1;
    }

    let button = e.which || e.button;
    return button === 1;
  }, []);

  const handleValueChange = useCallback(
    (newValue, choice) => {
      if (!onChange) return;
      const newChoices = choices.map((item) => {
        if (item.id === choice.id) {
          return { ...item, text: newValue };
        }
        return item;
      });
      onChange(newChoices);
    },
    [choices, onChange],
  );

  const startDrag = useCallback((e, index) => {
    if (!detectLeftButton()) return;

    setIsDragging(index);

    const container = dragContainerRef.current;
    const items = [...container.childNodes];
    const dragItem = items[index];
    const itemsBelowDragItem = items.slice(index + 1);
    const notDragItem = items.filter((_, i) => i !== index);
    const dragData = choices[index];
    let newData = [...choices];

    // getBoundingClientRect of dragItem
    const dragBoundingRect = dragItem.getBoundingClientRect();
    // Between two item
    const space = items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom;

    // Set style for dragItem when mouse down
    dragItem.style.position = "fixed";
    dragItem.style.zIndex = 500;
    dragItem.style.width = dragBoundingRect.width + "px";
    dragItem.style.height = dragBoundingRect.height + "px";
    dragItem.style.top = dragBoundingRect.top + "px";
    dragItem.style.left = dragBoundingRect.left + "px";
    dragItem.firstChild.style.cursor = "grabbing !important";

    // create alternate div element when dragItem position is fixed
    const div = document.createElement("div");
    div.id = "choice-temp";
    div.style.width = dragBoundingRect.width + "px";
    div.style.height = dragBoundingRect.height + "px";
    div.style.pointerEvents = "none";
    container.appendChild(div);

    // Move element
    const distance = dragBoundingRect.height + space;

    itemsBelowDragItem.forEach((item) => {
      item.style.transform = `translateY(${distance}px)`;
    });

    // Get the original coordinates of the mouse pointer
    let x = e.clientX;
    let y = e.clientY;

    document.onpointermove = dragMove;

    function dragMove(e) {
      const posX = e.clientX - x;
      const posY = e.clientY - y;

      // Move item
      dragItem.style.transform = `translate(${posX}px, ${posY}px)`;

      // Swap position and data
      notDragItem.forEach((item) => {
        // Check two elements is overlapping
        const rect1 = dragItem.getBoundingClientRect();
        const rect2 = item.getBoundingClientRect();

        let isOverlapping =
          rect1.y < rect2.y + rect2.height / 2 && rect1.y + rect1.height / 2 > rect2.y;
        if (isOverlapping) {
          // Swap position card
          if (item.getAttribute("style")) {
            item.style.transform = "";
            index++;
          } else {
            item.style.transform = `translateY(${distance}px)`;
            index--;
          }
          // Swap data
          newData = choices.filter((item) => item.id !== dragData.id);
          newData.splice(index, 0, dragData);
        }
      });
    }

    // Finish onPointerDown event
    document.onpointerup = dragEnd;

    function dragEnd() {
      document.onpointerup = "";
      document.onpointermove = "";
      setIsDragging(undefined);
      dragItem.style = "";
      dragItem.firstChild.style = "";
      container.removeChild(div);
      items.forEach((item) => {
        item.style = "";
      });
      if (!onChange) return;
      onChange(newData);
    }
  });

  const handleAddChoice = useCallback(() => {
    if (!onChange) return;
    const lastIndex = choices.reduce((max, obj) => {
      return obj.id > max ? obj.id : max;
    }, 0);
    const newChoices = [...choices, { id: lastIndex + 1 }];
    onChange(newChoices);
  }, [choices, onChange]);

  const handleChoiceRemove = useCallback(
    (index) => {
      if (!onChange) return;
      const newChoices = [...choices];
      newChoices.splice(index, 1);
      onChange(newChoices);
    },
    [choices, onChange],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>{title}</div>
      <div className={styles.list} ref={dragContainerRef}>
        {choices?.length > 0
          ? choices?.map((choice, index) => {
              const errorMsg = required && !choice.text.trim();

              return (
                <div key={`choice-${index}`} className={styles.item}>
                  <div className={styles.order} onPointerDown={(e) => startDrag(e, index)}>
                    <Icon source={DragHandleMinor} tone="subdued" />
                  </div>
                  <div className={styles.input}>
                    <TextField
                      value={choice.text}
                      placeholder="Enter choice"
                      showCharacterCount={choice.text?.length > 0}
                      maxLength={30}
                      onChange={(value) => handleValueChange(value, choice)}
                      autoComplete="off"
                      error={errorMsg}
                    />
                  </div>
                  <div
                    className={styles.remove}
                    data-disabled={choices.length <= min}
                    onClick={() => handleChoiceRemove(index)}
                  >
                    <Icon source={DeleteMinor} tone="subdued" />
                  </div>
                  {errorMsg ? (
                    <div className={styles.error}>
                      <InlineError message="Required field" />
                    </div>
                  ) : null}
                </div>
              );
            })
          : null}
      </div>
      {choices.length < max ? (
        <div className={styles.more} onClick={handleAddChoice}>
          <div className={styles.icon}>
            <Icon source={CirclePlusMinor} tone="base" />
          </div>
          <Text variant="headingSm" as="span">
            Add another choice
          </Text>
        </div>
      ) : null}
    </div>
  );
}
