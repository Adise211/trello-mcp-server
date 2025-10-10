import {
  CardLabel,
  cardSchema,
  updateCardSchema,
  commentSchema,
} from "../schema/card.schema";

const TRELLO_BASE_URL = "https://api.trello.com/1";

/**
 * Get a card by its ID
 * @param cardId - The ID of the card to get
 * @returns {Promise<any>} - A promise that resolves to the card
 */
export const getCardById = async (cardId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get all cards for a list
 * @param listId - The ID of the list to get cards for
 * @returns {Promise<any>} - A promise that resolves to an array of cards
 */
export const getListCards = async (listId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/lists/${listId}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get all labels for a card
 * @param cardId - The ID of the card to get labels for
 * @returns {Promise<any>} - A promise that resolves to an array of labels
 */

export const getCardLabels = async (cardId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}/labels?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Create a card
 * @param listId - The ID of the list to create the card on
 * @param name - The name of the card to create
 * @param desc - The description of the card to create
 * @param due - The due date of the card to create
 * @param labels - The labels of the card to create
 * @returns {Promise<any>} - A promise that resolves to the created card
 */
export const createCard = async (
  listId: string,
  name: string,
  desc: string,
  due: string,
  labels: CardLabel[]
): Promise<{ data?: any; error?: string }> => {
  try {
    const card = cardSchema.parse({
      name,
      desc,
      due,
      labels,
    });
    const response = await fetch(
      `${TRELLO_BASE_URL}/lists/${listId}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(card),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Update a card
 * @param cardId - The ID of the card to update
 * @param name - The name of the card to update
 * @param desc - The description of the card to update
 * @param due - The due date of the card to update
 * @param labels - The labels of the card to update
 * @returns {Promise<any>} - A promise that resolves to the updated card
 */
export const updateCard = async (
  cardId: string,
  name: string,
  desc: string,
  due: string
): Promise<any> => {
  try {
    // validate the card
    const card = updateCardSchema.parse({
      id: cardId,
      name,
      desc,
      due,
    });
    // build the params
    const params = new URLSearchParams({
      key: process.env.TRELLO_API_KEY!,
      token: process.env.TRELLO_TOKEN!,
      name: card.name,
      desc: card.desc,
      ...(card.due && { due: card.due }),
    });

    // make the request
    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}?${params.toString()}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );
    // get the data
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Add a comment to a card
 * @param cardId - The ID of the card to add a comment to
 * @param text - The comment to add to the card (supports rich text/HTML)
 * @returns {Promise<any>} - A promise that resolves to the added comment
 */
export const addCommentToCard = async (
  cardId: string,
  text: string
): Promise<any> => {
  try {
    // Validate and sanitize the comment text with rich text support
    const { text: sanitizedText } = commentSchema.parse({ text });

    // Use URLSearchParams for proper URL encoding
    const params = new URLSearchParams({
      text: sanitizedText,
      key: process.env.TRELLO_API_KEY!,
      token: process.env.TRELLO_TOKEN!,
    });

    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}/actions/comments?${params.toString()}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Add an attachment to a card
 * @param cardId - The ID of the card to add an attachment to
 * @param attachment - The attachment to add to the card
 * @returns {Promise<any>} - A promise that resolves to the added attachment
 */
export const addAttachmentToCard = async (
  cardId: string,
  attachment: File
): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}/attachments?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
      {
        method: "POST",
        body: attachment,
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Move a card to a list
 * @param cardId - The ID of the card to move
 * @param listId - The ID of the list to move the card to
 * @returns {Promise<any>} - A promise that resolves to the moved card
 */
export const moveCardToList = async (
  cardId: string,
  listId: string
): Promise<any> => {
  try {
    // Use URLSearchParams for proper URL encoding
    const params = new URLSearchParams({
      idList: listId,
      key: process.env.TRELLO_API_KEY!,
      token: process.env.TRELLO_TOKEN!,
    });

    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}?${params.toString()}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Delete a card
 * @param cardId - The ID of the card to delete
 * @returns {Promise<any>} - A promise that resolves to the deleted card
 */
export const deleteCard = async (cardId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Get all cards for a board
 * @param boardId - The ID of the board to get cards for
 * @returns {Promise<any>} - A promise that resolves to an array of cards
 */
export const getCardsByBoardId = async (boardId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/boards/${boardId}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      return { error: `HTTP ${response.status}: ${errorText}` };
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const cardService = {
  getCardById,
  getListCards,
  getCardLabels,
  createCard,
  updateCard,
  addCommentToCard,
  addAttachmentToCard,
  moveCardToList,
  deleteCard,
  getCardsByBoardId,
};
