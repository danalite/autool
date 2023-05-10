import { h } from "vue";
import { NCheckbox, NDynamicInput, NInput, NSpace, NText } from "naive-ui";

import { renderTitle } from "./common";
import { useStore } from "@/render/store";
const store = useStore();

const renderInput = (content) => {
    const v = store.getReturnValue();
    if (v[content.key] == null) {
        store.setValue(content.key, {
            options: content.advanced?.default ?? [],
            checked: [],
        });
    }
    return content.advanced?.dynamic
        ? h(
            NDynamicInput,
            {
                createButtonStyle: {
                    "margin-left": "30px",
                    "margin-top": "8px",
                    "margin-bottom": "8px",
                },
                onCreate: (index) => {
                    const e = store.getReturnValue()[content.key];
                    if (Array.isArray(e.options)) {
                        e.options.splice(index, 0, "");
                        store.setValue(content.key, e);
                    }
                    return "";
                },

                onRemove: (index) => {
                    const e = store.getReturnValue()[content.key];
                    if (Array.isArray(e.options)) {
                        e.options.splice(index, 1);
                        store.setValue(content.key, e);
                    }
                },

                size: "small",
                placeholder: content.placeholder,
                style: { "font-size": "14px" },
                defaultValue: store.getReturnValue()[content.key].options,
            },
            {
                default: ({ value, index }) =>
                    h(
                        "div",
                        {
                            style: {
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                            },
                        },
                        {
                            default: () => [
                                h(NCheckbox, {
                                    style: { marginRight: "12px" },
                                    onUpdateChecked: (v) => {
                                        const e = store.getReturnValue()[content.key];
                                        const current = e.options[index];
                                        if (v) {
                                            e.checked.push(current);
                                        } else {
                                            e.checked = e.checked.filter((item) => item !== current);
                                        }
                                        store.setValue(content.key, e);
                                    },
                                }),
                                h(NInput, {
                                    style: { "font-size": "14px" },
                                    defaultValue: value,
                                    onUpdateValue: (v) => {
                                        const e = store.getReturnValue()[content.key];
                                        e.options[index] = v;
                                        store.setValue(content.key, e);
                                    },
                                    size: "small",
                                    placeholder: content.placeholder,
                                    style: { "font-size": "14px" },
                                }),
                            ],
                        }
                    ),
            }
        )
        : h(NInput, {
            style: { "font-size": "14px" },
            onUpdateValue: (value) => {
                store.setValue(content.key, value);
            },
            size: "small",
            placeholder: content.placeholder,
            style: { "font-size": "14px" },
        });
};

export const renderText = (content) => {
    return h(
        NSpace,
        { vertical: true, style: {} },
        {
            default: () => [
                renderTitle(content.label),
                // Text input or a simple text to display
                content.key != null
                    ? renderInput(content)
                    : h(
                        NText,
                        {
                            style: {
                                "font-size": "14px",
                                "line-height": "0px",
                            },
                        },
                        { default: () => content.content }
                    ),
            ],
        }
    );
};