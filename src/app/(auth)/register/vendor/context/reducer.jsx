import initialState from "./initialState";

export default function reducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };

    case "UPDATE_ADDRESS":
      return {
        ...state,
        address: {
          ...state.address,
          ...action.payload,
        },
      };

    case "HYDRATE":
      return {
        ...initialState,
        ...action.payload,
      };

    case "RESET": 
      return initialState;

    default:
      return state;
  }
}