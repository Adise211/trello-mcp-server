import { z } from "zod";
import { cardService } from "../services/card.service";
import {
  CardLabel,
  createCardSchema,
  updateCardSchema,
} from "../schema/card.schema";

export const createCardTool = {
  name: "create-card",
  definition: {
    title: "Create Card",
    description: "Create a Trello card",
    inputSchema: createCardSchema.shape,
  },
  handler: async ({ name, listId, desc, due, labels }: any) => {
    const response = await cardService.createCard(
      listId.trim(),
      name?.trim() || "",
      desc?.trim() || "",
      due?.trim() || "",
      labels?.map((label: CardLabel) => ({
        id: label.id,
        idBoard: label.idBoard,
        name: label.name,
        color: label.color,
      })) || []
    );
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};

export const updateCardTool = {
  name: "update-card",
  definition: {
    title: "Update Card",
    description: "Update a Trello card",
    inputSchema: updateCardSchema.shape,
  },
  handler: async ({ id, name, desc, due }: any) => {
    const response = await cardService.updateCard(
      id.trim(),
      name?.trim() || "",
      desc?.trim() || "",
      due?.trim() || ""
    );
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};

export const deleteCardTool = {
  name: "delete-card",
  definition: {
    title: "Delete Card",
    description: "Delete a Trello card",
    inputSchema: {
      id: z.string().describe("The id of the card to delete"),
    },
  },
  handler: async ({ id }: { id: string }) => {
    const response = await cardService.deleteCard(id.trim());
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};

export const addCommentToCardTool = {
  name: "add-comment-to-card",
  definition: {
    title: "Add Comment to Card",
    description: "Add a comment to a Trello card",
    inputSchema: {
      id: z.string().describe("The id of the card to add a comment to"),
      text: z.string().describe("The comment to add to the card"),
    },
  },
  handler: async ({ id, text }: { id: string; text: string }) => {
    const response = await cardService.addCommentToCard(
      id.trim(),
      text?.trim() || ""
    );
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};

export const addAttachmentToCardTool = {
  name: "add-attachment-to-card",
  definition: {
    title: "Add Attachment to Card",
    description: "Add an attachment to a Trello card",
    inputSchema: {
      id: z.string().describe("The id of the card to add an attachment to"),
      attachment: z
        .any()
        .describe("The attachment to add to the card")
        .refine(
          (file) => {
            // Check if it's a File-like object with required properties
            return (
              file &&
              typeof file === "object" &&
              ("size" in file || "type" in file || "name" in file)
            );
          },
          {
            message: "Attachment must be a file object",
          }
        ),
    },
  },
  handler: async ({ id, attachment }: { id: string; attachment: any }) => {
    const response = await cardService.addAttachmentToCard(
      id.trim(),
      attachment
    );
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};

export const moveCardToListTool = {
  name: "move-card-to-list",
  definition: {
    title: "Move Card to List",
    description: "Move a Trello card to a list",
    inputSchema: {
      id: z.string().describe("The id of the card to move to a list"),
      listId: z.string().describe("The id of the list to move the card to"),
    },
  },
  handler: async ({ id, listId }: { id: string; listId: string }) => {
    const response = await cardService.moveCardToList(id.trim(), listId.trim());
    // on success, return the data
    if (!response.error) {
      return {
        content: [{ type: "text", text: JSON.stringify(response.data) }],
      };
    } else {
      // on error, return the error
      return {
        content: [{ type: "text", text: JSON.stringify(response.error) }],
      };
    }
  },
};
