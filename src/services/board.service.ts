// TODO: Move to environment variable
// TODO: Use one URL search params for all requests
const TRELLO_BASE_URL = "https://api.trello.com/1";

/**
 * Get all boards for the current user
 * @returns {Promise<any>} - A promise that resolves to an array of boards
 */
export const getBoards = async (): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/members/me/boards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
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
 * Get a board by its ID
 * @param boardId - The ID of the board to get
 * @returns {Promise<any>} - A promise that resolves to the board
 */
export const getBoardById = async (boardId: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/boards/${boardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
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
 * Get a board by its name
 * @param boardName - The name of the board to get
 * @returns {Promise<any>} - A promise that resolves to the board
 */
export const getBoardByName = async (boardName: string): Promise<any> => {
  try {
    const response: any = await getBoards();
    const board = response.data.find(
      (board: any) => board.name.toLowerCase() === boardName.toLowerCase()
    );
    if (!board) {
      return { error: "Board not found" };
    } else {
      return { data: board };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Create a board
 * @param boardName - The name of the board to create
 * @returns {Promise<any>} - A promise that resolves to the created board
 */
export const createBoard = async (boardName: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/boards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
      {
        method: "POST",
        body: JSON.stringify({ name: boardName }),
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

export const getListsByBoardId = async (boardName: string): Promise<any> => {
  try {
    const response = await fetch(
      `${TRELLO_BASE_URL}/boards/${boardName}/lists?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
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

export const boardService = {
  getBoards,
  getBoardById,
  getBoardByName,
  createBoard,
  getListsByBoardId,
};
