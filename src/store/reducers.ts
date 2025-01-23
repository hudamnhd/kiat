import { combineReducers } from "@reduxjs/toolkit";
import todoReducer from "#src/features/daily-tasks/slice";

export const rootReducer = combineReducers({
	tasks: todoReducer,
});
