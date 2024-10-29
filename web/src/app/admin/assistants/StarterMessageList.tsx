"use client";

import { ArrayHelpers, ErrorMessage, Field } from "formik";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

import { useEffect, useMemo, useState } from "react";
import { FiInfo, FiRefreshCcw } from "react-icons/fi";
import { Persona, StarterMessage } from "./interfaces";
import { Label } from "@/components/admin/connectors/Field";

// Create a new component for the starter messages
export default function StarterMessagesList({
  values,
  arrayHelpers,
  isRefreshing,
}: {
  values: StarterMessage[];
  arrayHelpers: ArrayHelpers;
  isRefreshing: boolean;
}) {
  useEffect(() => {
    const currentLength = values.length;
    if (currentLength < 4) {
      // Add empty messages until we have 4
      for (let i = currentLength; i < 4; i++) {
        arrayHelpers.push({
          name: "",
          description: "",
          message: "",
        });
      }
    } else if (currentLength > 4) {
      // Remove extra messages if we have more than 4
      for (let i = currentLength - 1; i >= 4; i--) {
        arrayHelpers.remove(i);
      }
    }
  }, []); // Empty dependency array means this only runs once on mount

  return (
    <div className="w-full mt-4 flex flex-wrap gap-6">
      {values.map((starterMessage: StarterMessage, index: number) => (
        <div
          key={index}
          className="max-w-2xl w-full bg-white border border-border rounded-lg shadow-md transition-shadow duration-200 p-6"
        >
          <div className="space-y-5">
            {isRefreshing ? (
              <div className="w-full">
                <div className="w-full">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex w-full items-center gap-x-1">
                    <Label small className="text-sm font-medium text-gray-700">
                      Name
                    </Label>
                    <TooltipProvider delayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo size={12} />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p className="bg-background-900 max-w-[200px] mb-1 text-sm rounded-lg p-1.5 text-white">
                            Shows up as the &quot;title&quot; for this Starter
                            Message. For example, &quot;Write an email.&quot;
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Field
                    name={`starter_messages.${index}.name`}
                    className="mt-1 w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    autoComplete="off"
                    placeholder="Enter a name..."
                  />
                  <ErrorMessage
                    name={`starter_messages.${index}.name`}
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <div className="flex w-full items-center gap-x-1">
                    <Label small className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <TooltipProvider delayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo size={12} />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p className="bg-background-900 max-w-[200px] mb-1 text-sm rounded-lg p-1.5 text-white">
                            A description which tells the user what they might
                            want to use this Starter Message for.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Field
                    name={`starter_messages.${index}.description`}
                    className="text-sm mt-1 w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    autoComplete="off"
                    as="textarea"
                    placeholder="Enter a description..."
                  />
                  <ErrorMessage
                    name={`starter_messages.${index}.description`}
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <div className="flex w-full items-center gap-x-1">
                    <Label small className="text-sm font-medium text-gray-700">
                      Message
                    </Label>
                    <TooltipProvider delayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo size={12} />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                          <p className="bg-background-900 max-w-[200px] mb-1 text-sm rounded-lg p-1.5 text-white">
                            The actual message to be sent as the initial user
                            message.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Field
                    name={`starter_messages.${index}.message`}
                    className="mt-1  text-sm  w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[100px] resize-y"
                    as="textarea"
                    autoComplete="off"
                    placeholder="Enter the message..."
                  />
                  <ErrorMessage
                    name={`starter_messages.${index}.message`}
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
