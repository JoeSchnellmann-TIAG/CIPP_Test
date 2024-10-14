import { Card, CardHeader, Divider, Skeleton, SvgIcon, Stack } from "@mui/material";
import { ActionList } from "../../components/action-list";
import { ActionListItem } from "../../components/action-list-item";
import { PropertyList } from "../../components/property-list";
import { PropertyListItem } from "../../components/property-list-item";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "../CippComponents/CippApiDialog";
import { useState } from "react";

export const CippPropertyListCard = (props) => {
  const {
    align = "vertical",
    actionItems = [],
    propertyItems = [],
    isFetching,
    title,
    actionButton,
    copyItems = false,
    data,
    layout = "single",
    showDivider = true,
    ...other
  } = props;
  const createDialog = useDialog();
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false });

  const half = Math.ceil(propertyItems.length / 2);
  const firstHalf = propertyItems.slice(0, half);
  const secondHalf = propertyItems.slice(half, propertyItems.length);

  return (
    <>
      <Card sx={{ width: "100%" }} {...other}>
        <CardHeader action={actionButton} title={title} />
        <Divider />

        {layout === "single" ? (
          <PropertyList>
            {isFetching ? (
              <PropertyListItem
                key={"loading-bar"}
                align={align}
                label="Loading"
                value={<Skeleton width={280} />}
              />
            ) : (
              propertyItems.map((item, index) => (
                <PropertyListItem
                  align={align}
                  divider={showDivider}
                  copyItems={copyItems}
                  key={`${index}-index-PropertyListOffCanvas`}
                  {...item}
                />
              ))
            )}
          </PropertyList>
        ) : (
          // Two-column layout
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            sx={{
              "& > *": {
                width: {
                  md: "50%",
                },
              },
            }}
          >
            <PropertyList>
              {isFetching ? (
                <PropertyListItem
                  key={"loading-bar"}
                  align={align}
                  divider={showDivider}
                  label="Loading"
                  value={<Skeleton width={280} />}
                />
              ) : (
                firstHalf.map((item, index) => (
                  <PropertyListItem
                    align={align}
                    divider={showDivider}
                    copyItems={copyItems}
                    key={`${index}-index-PropertyListOffCanvas`}
                    {...item}
                  />
                ))
              )}
            </PropertyList>
            <PropertyList>
              {secondHalf.map((item, index) => (
                <PropertyListItem
                  align={align}
                  divider={showDivider}
                  copyItems={copyItems}
                  key={`${index}-index-PropertyListOffCanvas`}
                  {...item}
                />
              ))}
            </PropertyList>
          </Stack>
        )}

        {showDivider && <Divider />}

        <ActionList>
          {actionItems.map((item, index) => (
            <ActionListItem
              key={`${item.label}-index-ActionList-OffCanvas`}
              icon={<SvgIcon fontSize="small">{item.icon}</SvgIcon>}
              label={item.label}
              onClick={
                item.link
                  ? () => window.open(item.link, "_blank")
                  : () => {
                      setActionData({
                        data: data,
                        action: item,
                        ready: true,
                      });
                      createDialog.handleOpen();
                    }
              }
            />
          ))}
        </ActionList>

        {actionData.ready && (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
          />
        )}
      </Card>
    </>
  );
};