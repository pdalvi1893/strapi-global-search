import React, { useEffect, useState } from 'react';

import taskRequests from '../../api/search-config';

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin';

import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Button } from '@strapi/design-system/Button';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { HeaderLayout } from '@strapi/design-system/Layout';
import { ContentLayout } from '@strapi/design-system/Layout';
import { Typography } from '@strapi/design-system/Typography';
import { ToggleInput } from '@strapi/design-system/ToggleInput';
import { TextInput, Textarea, Tooltip } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import getTrad from '../../utils/getTrad';

import Check from '@strapi/icons/Check';

const Settings = () => {
  const { formatMessage } = useIntl();
  const [settings, setSettings] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toggleNotification = useNotification();

  const [content, setContent] = useState('');

  useEffect(() => {
    taskRequests.getSettings().then((res) => {
      //setSettings(res.data.data);
      setContent(JSON.stringify(res.data));
      setIsLoading(false);
    });
  }, [setSettings, setContent]);

  // const handleSubmit = async () => {
  //   setIsSaving(true);
  //   console.log('test test 123', content);
  //   const res = await taskRequests.setSettings(settings);
  //   setSettings(res.data.settings);
  //   setIsSaving(false);
  //   toggleNotification({
  //     type: 'success',
  //     message: 'Settings successfully updated',
  //   });
  // };

  const handleSubmit = async () => {
    setIsSaving(true);
    console.log('test test 123', content);
    const res = await taskRequests.setSettings(content);
    setSettings(res.data.settings);
    setIsSaving(false);
    toggleNotification({
      type: 'success',
      message: 'Settings successfully updated',
    });
  };

  return (
    <>
      <HeaderLayout
        id="title"
        title="Simple Global Search Settings"
        subtitle="Manage the settings and behaviour of your todo plugin"
        primaryAction={
          isLoading ? (
            <></>
          ) : (
            <Button
              onClick={handleSubmit}
              startIcon={<Check />}
              size="L"
              disabled={isSaving}
              loading={isSaving}
            >
              Save
            </Button>
          )
        }
      ></HeaderLayout>
      {isLoading ? (
        <LoadingIndicatorPage />
      ) : (
        <ContentLayout>
          <Box
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            paddingTop={6}
            paddingBottom={6}
            paddingLeft={7}
            paddingRight={7}
          >
            <Stack size={3}>
              {/* <Typography>General settings</Typography> */}
              {/* <Grid gap={6}>
                <GridItem col={12} s={12}>
                  <ToggleInput
                    checked={settings?.disabled ?? false}
                    hint="Cross or disable checkbox tasks marked as done"
                    offLabel="Cross"
                    onLabel="Disable"
                    onChange={(e) => {
                      setSettings({
                        disabled: e.target.checked,
                      });
                    }}
                  />
                </GridItem>
              </Grid> */}
              <Grid gap={6}>
                <GridItem col={12} s={12}>
                  {/* <TextInput
                    name="response-email"
                    label={formatMessage({
                      id: getTrad('Settings.email.plugin.label.defaultReplyTo'),
                      defaultMessage: 'Settings JSON here',
                    })}
                    placeholder={formatMessage({
                      id: getTrad('Settings.email.plugin.placeholder.defaultReplyTo'),
                      defaultMessage: ``,
                    })}
                    onChange={() => {}}
                    //value={config.settings.defaultReplyTo}
                  /> */}

                  <Textarea
                    placeholder="This is a content placeholder"
                    label="Paste Settings JSON"
                    name="content"
                    hint=""
                    rows="8"
                    required
                    onChange={(e) => setContent(e.target.value)}
                    //onChange={(e) => setSettings(e.target.value)}
                    labelAction={
                      <Tooltip description="Content of the tooltip" position="right">
                        <button
                          aria-label="Information about the email"
                          style={{
                            border: 'none',
                            padding: 0,
                            background: 'transparent',
                          }}
                        >
                          {/* <Information aria-hidden={true} /> */}
                        </button>
                      </Tooltip>
                    }
                  >
                    {content}
                  </Textarea>
                </GridItem>
              </Grid>
            </Stack>
          </Box>
        </ContentLayout>
      )}
    </>
  );
};

export default Settings;
