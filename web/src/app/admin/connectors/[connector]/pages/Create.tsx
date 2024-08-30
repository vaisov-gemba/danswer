import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { FaPlus } from "react-icons/fa";
import { useUserGroups } from "@/lib/hooks";
import { UserGroup, User, UserRole } from "@/lib/types";
import { EditingValue } from "@/components/credentials/EditingValue";
import { Divider } from "@tremor/react";
import CredentialSubText from "@/components/credentials/CredentialFields";
import { TrashIcon } from "@/components/icons/icons";
import { FileUpload } from "@/components/admin/connectors/FileUpload";
import { ConnectionConfiguration } from "@/lib/connectors/connectors";
import { useFormContext } from "@/components/context/FormContext";
import { usePaidEnterpriseFeaturesEnabled } from "@/components/settings/usePaidEnterpriseFeaturesEnabled";
import { Text } from "@tremor/react";
import { getCurrentUser } from "@/lib/user";
import { FiUsers } from "react-icons/fi";

export interface DynamicConnectionFormProps {
  config: ConnectionConfiguration;
  selectedFiles: File[];
  initialName?: string;
  setSelectedFiles: Dispatch<SetStateAction<File[]>>;
  setIsPublic: Dispatch<SetStateAction<boolean>>;
  defaultValues: any;
  setName: Dispatch<SetStateAction<string>>;
  updateValues: (field: string, value: any) => void;
  isPublic: boolean;
  groups: number[];
  setGroups: Dispatch<SetStateAction<number[]>>;
  onFormStatusChange: (isValid: boolean) => void; // New prop
}

const DynamicConnectionForm: React.FC<DynamicConnectionFormProps> = ({
  config,
  setName,
  updateValues,
  defaultValues,
  selectedFiles,
  setSelectedFiles,
  isPublic,
  setIsPublic,
  groups,
  setGroups,
  initialName,
  onFormStatusChange,
}) => {
  const isPaidEnterpriseFeaturesEnabled = usePaidEnterpriseFeaturesEnabled();
  const { setAllowAdvanced } = useFormContext();
  const { data: userGroups, isLoading: userGroupsIsLoading } = useUserGroups();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const userIsAdmin = user.role === UserRole.ADMIN;
          setIsAdmin(userIsAdmin);
          if (!userIsAdmin) {
            setIsPublic(false);
          }
        } else {
          console.error("Failed to fetch current user");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, [setIsPublic]);

  const initialValues = {
    name: initialName || "",
    groups: [], // Initialize groups as an empty array
    ...(defaultValues ||
      config.values.reduce(
        (acc, field, ind) => {
          acc[field.name] = defaultValues
            ? defaultValues[field.name]
            : config.values[ind].hidden
              ? config.values[ind].default
              : field.type === "list"
                ? [""]
                : field.type === "checkbox"
                  ? false
                  : "";
          return acc;
        },
        {} as Record<string, any>
      )),
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Connector Name is required"),
    ...config.values.reduce(
      (acc, field) => {
        let schema: any =
          field.type === "list"
            ? Yup.array().of(Yup.string())
            : field.type === "checkbox"
              ? Yup.boolean()
              : Yup.string();

        if (!field.optional) {
          schema = schema.required(`${field.label} is required`);
        }
        acc[field.name] = schema;
        return acc;
      },
      {} as Record<string, any>
    ),
  });

  const updateValue =
    (setFieldValue: Function) => (field: string, value: any) => {
      setFieldValue(field, value);
      updateValues(field, value);
    };

  const isFormSubmittable = (values: any) => {
    return (
      values.name.trim() !== "" &&
      Object.keys(values).every((key) => {
        const field = config.values.find((f) => f.name === key);
        return field?.optional || values[key] !== "";
      })
    );
  };

  return (
    <div className="py-4 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-text-800">
        {config.description}
      </h2>
      {config.subtext && (
        <CredentialSubText>{config.subtext}</CredentialSubText>
      )}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={() => {
          // Can be used for logging
        }}
      >
        {({ setFieldValue, values, isValid }) => {
          onFormStatusChange(isValid && isFormSubmittable(values));
          setAllowAdvanced(isValid && isFormSubmittable(values));
          return (
            <Form className="space-y-6">
              <EditingValue
                description="A descriptive name for the connector. This will be used to identify the connector in the Admin UI."
                setFieldValue={updateValue(setFieldValue)}
                type={"text"}
                label={"Connector Name"}
                name={"name"}
                currentValue=""
                onChange={(value: string) => setName(value)}
              />
              {config.values.map((field) => {
                if (!field.hidden) {
                  return (
                    <div key={field.name}>
                      {field.type == "file" ? (
                        <FileUpload
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                        />
                      ) : field.type == "zip" ? (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-text-700 mb-1"
                          >
                            {field.label}
                            {field.optional && (
                              <span className="text-text-500 ml-1">
                                (optional)
                              </span>
                            )}
                          </label>
                          {field.description && (
                            <CredentialSubText>
                              {field.description}
                            </CredentialSubText>
                          )}
                          <FileUpload
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                          />
                        </>
                      ) : field.type === "list" ? (
                        <FieldArray name={field.name}>
                          {({ push, remove }) => (
                            <div>
                              <label
                                htmlFor={field.name}
                                className="block text-sm font-medium text-text-700 mb-1"
                              >
                                {field.label}
                                {field.optional && (
                                  <span className="text-text-500 ml-1">
                                    (optional)
                                  </span>
                                )}
                              </label>
                              {field.description && (
                                <CredentialSubText>
                                  {field.description}
                                </CredentialSubText>
                              )}

                              {values[field.name].map(
                                (_: any, index: number) => (
                                  <div key={index} className="w-full flex mb-4">
                                    <Field
                                      name={`${field.name}.${index}`}
                                      className="w-full bg-input text-sm p-2 border border-border-medium rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mr-2"
                                      onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                      ) => {
                                        const newValue = [
                                          ...values[field.name],
                                        ];
                                        newValue[index] = e.target.value;
                                        updateValue(setFieldValue)(
                                          field.name,
                                          newValue
                                        );
                                      }}
                                      value={values[field.name][index]}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        remove(index);
                                        const newValue = values[
                                          field.name
                                        ].filter(
                                          (_: any, i: number) => i !== index
                                        );
                                        updateValue(setFieldValue)(
                                          field.name,
                                          newValue
                                        );
                                      }}
                                      className="p-2 my-auto bg-input flex-none rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                    >
                                      <TrashIcon className="text-white my-auto" />
                                    </button>
                                  </div>
                                )
                              )}

                              <button
                                type="button"
                                onClick={() => push("")}
                                className="mt-2 p-2 bg-rose-500 text-xs text-white rounded-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 flex items-center"
                              >
                                <FaPlus className="mr-2" />
                                Add {field.label}
                              </button>
                            </div>
                          )}
                        </FieldArray>
                      ) : field.type === "select" ? (
                        <>
                          <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-text-700 mb-1"
                          >
                            {field.label}
                            {field.optional && (
                              <span className="text-text-500 ml-1">
                                (optional)
                              </span>
                            )}
                          </label>
                          {field.description && (
                            <CredentialSubText>
                              {field.description}
                            </CredentialSubText>
                          )}

                          <Field
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>
                            ) =>
                              updateValue(setFieldValue)(
                                field.name,
                                e.target.value
                              )
                            }
                            as="select"
                            value={values[field.name]}
                            name={field.name}
                            className="w-full p-2 border bg-input border-border-medium rounded-md bg-black 
                              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option.name} value={option.name}>
                                {option.name}
                              </option>
                            ))}
                          </Field>
                        </>
                      ) : (
                        <EditingValue
                          description={field.description}
                          optional={field.optional}
                          setFieldValue={updateValue(setFieldValue)}
                          type={field.type}
                          label={field.label}
                          name={field.name}
                          currentValue={values[field.name]}
                        />
                      )}
                    </div>
                  );
                }
              })}
              {isPaidEnterpriseFeaturesEnabled && (
                <>
                  <Divider />
                  {isAdmin && (
                    <EditingValue
                      description={`If set, then documents indexed by this connector will be visible to all users. If turned off, then only users who explicitly have been given access to the documents (e.g. through a User Group) will have access`}
                      optional
                      setFieldValue={(field: string, value: boolean) => {
                        setIsPublic(value);
                        if (value) {
                          setGroups([]); // Clear groups when setting to public
                        }
                      }}
                      type={"checkbox"}
                      label={"Documents are Public?"}
                      name={"public"}
                      currentValue={isPublic}
                    />
                  )}
                  {userGroups &&
                    (!isAdmin || (!isPublic && userGroups.length > 0)) && (
                      <div>
                        <div className="flex gap-x-2 items-center">
                          <div className="block font-medium text-base">
                            Assign group access for this Connector
                          </div>
                        </div>
                        <Text className="mb-3">
                          {isAdmin ? (
                            <>
                              This Connector will be visible/accessible by the
                              groups selected below
                            </>
                          ) : (
                            <>
                              Curators must select one or more groups to give
                              access to this Connector
                            </>
                          )}
                        </Text>
                        <FieldArray
                          name="groups"
                          render={() => (
                            <div className="flex gap-2 flex-wrap">
                              {!userGroupsIsLoading &&
                                userGroups.map((userGroup: UserGroup) => {
                                  const isSelected =
                                    groups?.includes(userGroup.id) ||
                                    (!isAdmin && userGroups.length === 1);

                                  // Auto-select the only group for non-admin users
                                  if (
                                    !isAdmin &&
                                    userGroups.length === 1 &&
                                    groups.length === 0
                                  ) {
                                    setGroups([userGroup.id]);
                                  }

                                  return (
                                    <div
                                      key={userGroup.id}
                                      className={`
                                        px-3 
                                        py-1
                                        rounded-lg 
                                        border
                                        border-border 
                                        w-fit 
                                        flex 
                                        cursor-pointer 
                                        ${isSelected ? "bg-background-strong" : "hover:bg-hover"}
                                      `}
                                      onClick={() => {
                                        if (setGroups) {
                                          if (
                                            isSelected &&
                                            (isAdmin || userGroups.length > 1)
                                          ) {
                                            setGroups(
                                              groups?.filter(
                                                (id) => id !== userGroup.id
                                              ) || []
                                            );
                                          } else if (!isSelected) {
                                            setGroups([
                                              ...(groups || []),
                                              userGroup.id,
                                            ]);
                                          }
                                        }
                                      }}
                                    >
                                      <div className="my-auto flex">
                                        <FiUsers className="my-auto mr-2" />{" "}
                                        {userGroup.name}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        />
                      </div>
                    )}
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DynamicConnectionForm;