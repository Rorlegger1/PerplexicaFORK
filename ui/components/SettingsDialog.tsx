import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { CloudUpload, RefreshCcw, RefreshCw } from 'lucide-react';
import React, { Fragment, useEffect, useState } from 'react';
import ThemeSwitcher from './theme/Switcher';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...restProps }: InputProps) => {
  return (
    <input
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    />
  );
};

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export const Select = ({ className, options, ...restProps }: SelectProps) => {
  return (
    <select
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    >
      {options.map(({ label, value, disabled }) => (
        <option key={value} value={value} disabled={disabled}>
          {label}
        </option>
      ))}
    </select>
  );
};

interface ModelInfo {
  name: string;
  displayName: string;
}

interface SettingsType {
  chatModelProviders: {
    [key: string]: ModelInfo[];
  };
  embeddingModelProviders: {
    [key: string]: ModelInfo[];
  };
  openaiApiKey: string;
  groqApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  openrouterApiKey: string;
  openrouterHttpReferer: string;
  openrouterAppName: string;
  ollamaApiUrl: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, setIsOpen }) => {
  const [config, setConfig] = useState<SettingsType | null>(null);
  const [chatModels, setChatModels] = useState<Record<string, ModelInfo[]>>({});
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, ModelInfo[]>>({});
  const [selectedChatModelProvider, setSelectedChatModelProvider] = useState<string | null>(null);
  const [selectedChatModel, setSelectedChatModel] = useState<string | null>(null);
  const [selectedEmbeddingModelProvider, setSelectedEmbeddingModelProvider] = useState<string | null>(null);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<string | null>(null);
  const [customOpenAIApiKey, setCustomOpenAIApiKey] = useState('');
  const [customOpenAIBaseURL, setCustomOpenAIBaseURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = (await res.json()) as SettingsType;
          setConfig(data);

          const chatModelProvidersKeys = Object.keys(data.chatModelProviders || {});
          const embeddingModelProvidersKeys = Object.keys(data.embeddingModelProviders || {});

          const defaultChatModelProvider = chatModelProvidersKeys.length > 0 ? chatModelProvidersKeys[0] : '';
          const defaultEmbeddingModelProvider = embeddingModelProvidersKeys.length > 0 ? embeddingModelProvidersKeys[0] : '';

          const chatModelProvider = localStorage.getItem('chatModelProvider') || defaultChatModelProvider;
          const chatModel = localStorage.getItem('chatModel') || 
            (data.chatModelProviders?.[chatModelProvider]?.[0]?.name ?? '');
          const embeddingModelProvider = localStorage.getItem('embeddingModelProvider') || defaultEmbeddingModelProvider;
          const embeddingModel = localStorage.getItem('embeddingModel') || 
            (data.embeddingModelProviders?.[embeddingModelProvider]?.[0]?.name ?? '');

          setSelectedChatModelProvider(chatModelProvider);
          setSelectedChatModel(chatModel);
          setSelectedEmbeddingModelProvider(embeddingModelProvider);
          setSelectedEmbeddingModel(embeddingModel);
          setCustomOpenAIApiKey(localStorage.getItem('openAIApiKey') || '');
          setCustomOpenAIBaseURL(localStorage.getItem('openAIBaseURL') || '');
          setChatModels(data.chatModelProviders || {});
          setEmbeddingModels(data.embeddingModelProviders || {});
        } catch (error) {
          console.error('Error fetching config:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchConfig();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!config) return;
    
    setIsUpdating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (selectedChatModelProvider) localStorage.setItem('chatModelProvider', selectedChatModelProvider);
      if (selectedChatModel) localStorage.setItem('chatModel', selectedChatModel);
      if (selectedEmbeddingModelProvider) localStorage.setItem('embeddingModelProvider', selectedEmbeddingModelProvider);
      if (selectedEmbeddingModel) localStorage.setItem('embeddingModel', selectedEmbeddingModel);
      localStorage.setItem('openAIApiKey', customOpenAIApiKey);
      localStorage.setItem('openAIBaseURL', customOpenAIBaseURL);
    } catch (error) {
      console.error('Error updating config:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
      window.location.reload();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/50 dark:bg-black/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-200"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform rounded-2xl bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="text-xl font-medium leading-6 dark:text-white">
                  Settings
                </DialogTitle>
                {config && !isLoading && (
                  <div className="flex flex-col space-y-4 mt-6">
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Theme
                      </p>
                      <ThemeSwitcher />
                    </div>
                    {config.chatModelProviders && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Chat model Provider
                        </p>
                        <Select
                          value={selectedChatModelProvider ?? undefined}
                          onChange={(e) => {
                            setSelectedChatModelProvider(e.target.value);
                            if (e.target.value === 'custom_openai') {
                              setSelectedChatModel('');
                            } else {
                              setSelectedChatModel(
                                config.chatModelProviders[e.target.value][0]
                                  .name,
                              );
                            }
                          }}
                          options={Object.keys(config.chatModelProviders).map(
                            (provider) => ({
                              value: provider,
                              label:
                                provider.charAt(0).toUpperCase() +
                                provider.slice(1),
                            }),
                          )}
                        />
                      </div>
                    )}
                    {selectedChatModelProvider &&
                      selectedChatModelProvider != 'custom_openai' && (
                        <div className="flex flex-col space-y-1">
                          <p className="text-black/70 dark:text-white/70 text-sm">
                            Chat Model
                          </p>
                          <Select
                            value={selectedChatModel ?? undefined}
                            onChange={(e) =>
                              setSelectedChatModel(e.target.value)
                            }
                            options={(() => {
                              const chatModelProvider =
                                config.chatModelProviders[
                                  selectedChatModelProvider
                                ];

                              return chatModelProvider
                                ? chatModelProvider.length > 0
                                  ? chatModelProvider.map((model) => ({
                                      value: model.name,
                                      label: model.displayName,
                                    }))
                                  : [
                                      {
                                        value: '',
                                        label: 'No models available',
                                        disabled: true,
                                      },
                                    ]
                                : [
                                    {
                                      value: '',
                                      label:
                                        'Invalid provider, please check backend logs',
                                      disabled: true,
                                    },
                                  ];
                            })()}
                          />
                        </div>
                      )}
                    {selectedChatModelProvider &&
                      selectedChatModelProvider === 'custom_openai' && (
                        <>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Model name
                            </p>
                            <Input
                              type="text"
                              placeholder="Model name"
                              defaultValue={selectedChatModel!}
                              onChange={(e) =>
                                setSelectedChatModel(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Custom OpenAI API Key
                            </p>
                            <Input
                              type="text"
                              placeholder="Custom OpenAI API Key"
                              defaultValue={customOpenAIApiKey!}
                              onChange={(e) =>
                                setCustomOpenAIApiKey(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <p className="text-black/70 dark:text-white/70 text-sm">
                              Custom OpenAI Base URL
                            </p>
                            <Input
                              type="text"
                              placeholder="Custom OpenAI Base URL"
                              defaultValue={customOpenAIBaseURL!}
                              onChange={(e) =>
                                setCustomOpenAIBaseURL(e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                    {/* Embedding models */}
                    {config.embeddingModelProviders && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Embedding model Provider
                        </p>
                        <Select
                          value={selectedEmbeddingModelProvider ?? undefined}
                          onChange={(e) => {
                            setSelectedEmbeddingModelProvider(e.target.value);
                            setSelectedEmbeddingModel(
                              config.embeddingModelProviders[e.target.value][0]
                                .name,
                            );
                          }}
                          options={Object.keys(
                            config.embeddingModelProviders,
                          ).map((provider) => ({
                            label:
                              provider.charAt(0).toUpperCase() +
                              provider.slice(1),
                            value: provider,
                          }))}
                        />
                      </div>
                    )}
                    {selectedEmbeddingModelProvider && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-black/70 dark:text-white/70 text-sm">
                          Embedding Model
                        </p>
                        <Select
                          value={selectedEmbeddingModel ?? undefined}
                          onChange={(e) =>
                            setSelectedEmbeddingModel(e.target.value)
                          }
                          options={(() => {
                            const embeddingModelProvider =
                              config.embeddingModelProviders[
                                selectedEmbeddingModelProvider
                              ];

                            return embeddingModelProvider
                              ? embeddingModelProvider.length > 0
                                ? embeddingModelProvider.map((model) => ({
                                    label: model.displayName,
                                    value: model.name,
                                  }))
                                : [
                                    {
                                      label: 'No embedding models available',
                                      value: '',
                                      disabled: true,
                                    },
                                  ]
                              : [
                                  {
                                    label:
                                      'Invalid provider, please check backend logs',
                                    value: '',
                                    disabled: true,
                                  },
                                ];
                          })()}
                        />
                      </div>
                    )}
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        OpenAI API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="OpenAI API Key"
                        defaultValue={config.openaiApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openaiApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Ollama API URL
                      </p>
                      <Input
                        type="text"
                        placeholder="Ollama API URL"
                        defaultValue={config.ollamaApiUrl}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ollamaApiUrl: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        GROQ API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="GROQ API Key"
                        defaultValue={config.groqApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            groqApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Anthropic API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="Anthropic API key"
                        defaultValue={config.anthropicApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            anthropicApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        Gemini API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="Gemini API key"
                        defaultValue={config.geminiApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            geminiApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        OpenRouter API Key
                      </p>
                      <Input
                        type="text"
                        placeholder="OpenRouter API Key"
                        defaultValue={config.openrouterApiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openrouterApiKey: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        OpenRouter HTTP Referer
                      </p>
                      <Input
                        type="text"
                        placeholder="Your site URL for OpenRouter rankings"
                        defaultValue={config.openrouterHttpReferer}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openrouterHttpReferer: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-black/70 dark:text-white/70 text-sm">
                        OpenRouter App Name
                      </p>
                      <Input
                        type="text"
                        placeholder="Your app name for OpenRouter rankings"
                        defaultValue={config.openrouterAppName}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            openrouterAppName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}
                {isLoading && (
                  <div className="w-full flex items-center justify-center mt-6 text-black/70 dark:text-white/70 py-6">
                    <RefreshCcw className="animate-spin" />
                  </div>
                )}
                <div className="w-full mt-6 space-y-2">
                  <p className="text-xs text-black/50 dark:text-white/50">
                    We&apos;ll refresh the page after updating the settings.
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="bg-[#24A0ED] flex flex-row items-center space-x-2 text-white disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#ececec21] rounded-full px-4 py-2"
                    disabled={isLoading || isUpdating}
                  >
                    {isUpdating ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <CloudUpload size={20} />
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsDialog;
