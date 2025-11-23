import React from 'react';
import {
  Key,
  Code,
  Webhook,
  Copy,
  Check,
  Shield,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import * as Tabs from '@radix-ui/react-tabs';

import PageHeader from "@/components/layout/PageHeader";
import PageContainer from "@/components/layout/PageContainer";
import { theme } from "@/styles/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const apiKey = "pk_live_51Abc123XyZ789...";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copied to clipboard");
  };

  const TabTrigger = ({ value, icon: Icon, label }: any) => (
    <Tabs.Trigger
      value={value}
      className="group flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600 transition-all outline-none"
    >
      <Icon size={16} className="group-data-[state=active]:text-blue-600" />
      {label}
    </Tabs.Trigger>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      <PageHeader
        title="Settings"
        subtitle="Configure your platform settings and integrations"
      />

      <PageContainer>
        <Tabs.Root defaultValue="api" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Tabs.List style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.colors.border.default}`,
            marginBottom: '8px'
          }}>
            <TabTrigger value="api" icon={Key} label="API Configuration" />
            <TabTrigger value="sdk" icon={Code} label="SDK Integration" />
            <TabTrigger value="webhooks" icon={Webhook} label="Webhooks" />
          </Tabs.List>

          <Tabs.Content value="api" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border.default}`,
              padding: '32px',
              maxWidth: '800px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.primary[50], color: theme.colors.primary[600] }}>
                  <Key size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>API Keys</h3>
                  <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Manage your API keys for backend integration</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Production API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm pr-10 bg-gray-50"
                      />
                      <Shield size={14} className="absolute right-3 top-3 text-green-600" />
                    </div>
                    <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                      <Copy size={14} />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this key to authenticate API requests from your backend. Keep it secret!
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Code size={14} />
                    API Endpoints
                  </p>
                  <div className="space-y-2 text-xs font-mono text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">POST</span>
                      /v1/track - Track events
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">POST</span>
                      /v1/identify - Identify users
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">GET</span>
                      /v1/campaigns - Fetch campaigns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="sdk" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border.default}`,
              padding: '32px',
              maxWidth: '800px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.purple[50], color: theme.colors.purple[600] }}>
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>SDK Integration</h3>
                  <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Install the SDK in your mobile application</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs">1</span>
                    Android Integration
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800">
                    <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                      {`// 1. Add dependency in build.gradle
dependencies {
    implementation 'com.nudgeplatform:sdk:1.0.0'
}

// 2. Initialize in Application.java
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        NudgePlatform.initialize(this, "${apiKey}");
    }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs">2</span>
                    iOS Integration
                  </h4>
                  <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800">
                    <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                      {`// 1. Add pod in Podfile
pod 'NudgePlatform', '~> 1.0'

// 2. Initialize in AppDelegate.swift
func application(...) -> Bool {
    NudgePlatform.initialize(apiKey: "${apiKey}")
    return true
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="webhooks" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.lg,
              border: `1px solid ${theme.colors.border.default}`,
              padding: '32px',
              maxWidth: '800px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: theme.colors.warning, color: 'white' }}>
                  <Webhook size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: theme.colors.text.primary }}>Webhooks</h3>
                  <p style={{ fontSize: '14px', color: theme.colors.text.secondary }}>Receive real-time notifications about campaign events</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-domain.com/webhooks/nudge"
                      className="font-mono text-sm"
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Save
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-semibold mb-2 text-blue-900">Supported Events</p>
                  <ul className="text-xs space-y-2 text-blue-800">
                    <li className="flex items-center gap-2"><Check size={12} /> campaign.impression - When a nudge is shown</li>
                    <li className="flex items-center gap-2"><Check size={12} /> campaign.click - When a user clicks a nudge</li>
                    <li className="flex items-center gap-2"><Check size={12} /> campaign.conversion - When a conversion goal is met</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </PageContainer>
    </div>
  );
};

export default Settings;
