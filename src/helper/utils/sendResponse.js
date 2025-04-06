import { NextResponse } from "next/server";

export const sendResponse = function (
  status,
  data,
  message,
  statusCode = 200,
  apiVersion = null
) {
  const responseData = {
    status,
    data,
    message,
    apiVersion: apiVersion || "No Version",
  };

  return NextResponse.json(responseData, {
    status: statusCode,
  });
};
