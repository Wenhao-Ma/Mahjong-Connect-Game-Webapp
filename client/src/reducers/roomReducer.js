
const initialState = {};

export default function(state = initialState, action) {
  switch(action.type) {
    case "ROOM_ACTION":
      return action.room;
    default:
      return state;
  }
}

