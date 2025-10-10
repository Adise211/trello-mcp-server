import { z } from "zod";
import validator from "validator";
import sanitizeHtml from "sanitize-html";

export const labelColorSchema = z.enum([
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
  "sky",
  "lime",
  "pink",
  "black",
]);

export const cardLabelSchema = z.object({
  id: z.string().describe("The id of the label"),
  idBoard: z.string().describe("The id of the board the label is on"),
  name: z.string().describe("The name of the label"),
  color: labelColorSchema.describe("The color of the label"),
});

export const cardSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(16384) // Trello's character limit
    .transform((val) => validator.trim(val))
    .describe("The name of the card"),
  desc: z
    .string()
    .max(16384) // Trello's character limit
    .transform((val) => validator.trim(val))
    .describe("The description of the card"),
  due: z.string().optional().describe("The due date of the card"),
  labels: z
    .array(cardLabelSchema)
    .optional()
    .describe("The labels of the card"),
});

export const createCardSchema = cardSchema.extend({
  listId: z.string().describe("The id of the list to create the card"),
});

export const updateCardSchema = cardSchema.extend({
  id: z.string().describe("The id of the card to update"),
});

// Schema for comment with rich text support
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(16384) // Trello's character limit
    .transform((val) => {
      // First trim whitespace
      const trimmed = validator.trim(val);
      // Then sanitize HTML, allowing safe formatting tags
      return sanitizeHtml(trimmed, {
        allowedTags: [
          "b",
          "i",
          "em",
          "strong",
          "a",
          "p",
          "br",
          "ul",
          "ol",
          "li",
          "code",
          "pre",
          "blockquote",
        ],
        allowedAttributes: {
          a: ["href", "target"],
        },
        // Ensure links open in new tab for security
        transformTags: {
          a: (tagName, attribs) => ({
            tagName,
            attribs: {
              ...attribs,
              target: "_blank",
              rel: "noopener noreferrer",
            },
          }),
        },
      });
    })
    .describe("The comment text with rich text support"),
});

export type Card = z.infer<typeof cardSchema>;
export type CardLabel = z.infer<typeof cardLabelSchema>;
export type Comment = z.infer<typeof commentSchema>;
