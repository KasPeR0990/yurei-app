
// /components/ui/form-component.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useWindowSize from '@/hooks/use-window-size';
import { SearchGroup, SearchGroupId, searchGroups } from '@/utils/client-utils';
import { cn } from '@/utils/utils';
import { UIMessage } from '@ai-sdk/ui-utils';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { ArrowElbowDownRight } from '@phosphor-icons/react';

// **Props Interface**
interface FormComponentProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  stop: () => void;
  messages: Array<UIMessage>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  selectedGroup: SearchGroupId;
  setSelectedGroup: React.Dispatch<React.SetStateAction<SearchGroupId>>;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  lastSubmittedQueryRef: React.MutableRefObject<string>;
}

// **Group Selector Props**
interface GroupSelectorProps {
  selectedGroup: SearchGroupId;
  onGroupSelect: (group: SearchGroup) => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

// **Toolbar Button Props**
interface ToolbarButtonProps {
  group: SearchGroup;
  isSelected: boolean;
  onClick: () => void;
}

// **Switch Notification Props**
interface SwitchNotificationProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isVisible: boolean;
}

// **Switch Notification Component**
const SwitchNotification: React.FC<SwitchNotificationProps> = ({
  icon,
  title,
  description,
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="w-full mt-2 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 pl-2"
        >
          <ArrowElbowDownRight className="size-4 text-neutral-500 dark:text-neutral-400" />
          <span className="font-medium">{title}</span>
          <span className="text-neutral-400 dark:text-neutral-500">{description}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// **Toolbar Button Component**
const ToolbarButton = ({ group, isSelected, onClick }: ToolbarButtonProps) => {
  const Icon = group.icon;
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;

  const commonClassNames = cn(
    'relative flex items-center justify-center',
    'size-9',
    'rounded-full',
    'transition-colors duration-300',
    isSelected
      ? 'bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-300'
      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80',
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  if (isMobile) {
    return (
      <button onClick={handleClick} className={commonClassNames} style={{ WebkitTapHighlightColor: 'transparent' }}>
        <Icon className="size-6" />
      </button>
    );
  }

  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleClick} className={commonClassNames}>
      <Icon className="size-6" />
    </motion.button>
  );
};

// **Selection Content Component**
interface SelectionContentProps {
  selectedGroup: SearchGroupId;
  onGroupSelect: (group: SearchGroup) => void;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  onExpandChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectionContent = ({ selectedGroup, onGroupSelect, status, onExpandChange }: SelectionContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isProcessing = status === 'submitted' || status === 'streaming';
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;

  useEffect(() => {
    if (onExpandChange) {
      onExpandChange(isMobile ? isExpanded : false);
    }
  }, [isExpanded, onExpandChange, isMobile]);

  // Filter to only include LinkedIn, YouTube, and Reddit
  const allowedGroups = ['youtube','linkedin', 'reddit'];

  return (
    <motion.div
      layout={false}
      initial={false}
      animate={{
        width: isExpanded && !isProcessing ? 'auto' : '38px',
        gap: isExpanded && !isProcessing ? '0.5rem' : 0,
        paddingRight: isExpanded && !isProcessing ? '0.25rem' : 0,
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'inline-flex items-center min-w-[46px] p-0.5',
        'rounded-fullshadow-sm overflow-visible',
        'relative z-10',
        isProcessing && 'opacity-50 pointer-events-none',
      )}
      onMouseEnter={() => !isProcessing && setIsExpanded(true)}
      onMouseLeave={() => !isProcessing && setIsExpanded(false)}
    >
      <AnimatePresence initial={false}>
        {searchGroups
          .filter((group) => allowedGroups.includes(group.id))
          .map((group, index, filteredGroups) => {
            const showItem = (isExpanded && !isProcessing) || selectedGroup === group.id;
            const isLastItem = index === filteredGroups.length - 1;
            return (
              <motion.div
                key={group.id}
                layout={false}
                animate={{
                  width: showItem ? '36px' : 0,
                  opacity: showItem ? 1 : 0,
                  marginRight: showItem && isLastItem && isExpanded ? '2px' : 0,
                }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className={cn('!m-0', isLastItem && isExpanded && showItem ? 'pr-0.5' : '')}
              >
                <ToolbarButton
                  group={group}
                  isSelected={selectedGroup === group.id}
                  onClick={() => !isProcessing && onGroupSelect(group)}
                />
              </motion.div>
            );
          })}
      </AnimatePresence>
    </motion.div>
  );
};

// **Group Selector Component**
const GroupSelector = ({ selectedGroup, onGroupSelect, status, onExpandChange }: GroupSelectorProps) => {
  return <SelectionContent selectedGroup={selectedGroup} onGroupSelect={onGroupSelect} status={status} onExpandChange={onExpandChange} />;
};

// **Arrow Up Icon**
const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} strokeLinejoin="round" viewBox="0 0 16 16" width={size} style={{ color: 'currentcolor' }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

// **Stop Icon**
const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} viewBox="0 0 16 16" width={size} style={{ color: 'currentcolor' }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M3 3H13V13H3V3Z" fill="currentColor"></path>
    </svg>
  );
};

// **Constants**
const MAX_INPUT_CHARS = 10000;

// **Main Form Component**
const FormComponent: React.FC<FormComponentProps> = ({
  input,
  setInput,
  handleSubmit,
  inputRef,
  stop,
  messages,
  selectedGroup,
  setSelectedGroup,
  status,
  setHasSubmitted,
  append,
  lastSubmittedQueryRef,
}) => {
  const MIN_HEIGHT = 72;
  const MAX_HEIGHT = 400;

  const isCompositionActive = useRef(false);
  const { width } = useWindowSize();
  const [isFocused, setIsFocused] = useState(true);
  const [isGroupSelectorExpanded, setIsGroupSelectorExpanded] = useState(false);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [switchNotification, setSwitchNotification] = useState<{
    show: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    visibilityTimeout?: NodeJS.Timeout;
  }>({
    show: false,
    icon: null,
    title: '',
    description: '',
    visibilityTimeout: undefined,
  });

  // **Show Notification**
  const showSwitchNotification = (title: string, description: string, icon?: React.ReactNode) => {
    if (switchNotification.visibilityTimeout) {
      clearTimeout(switchNotification.visibilityTimeout);
    }

    setSwitchNotification({
      show: true,
      icon: icon || null,
      title,
      description,
      visibilityTimeout: undefined,
    });

    const timeout = setTimeout(() => {
      setSwitchNotification((prev) => ({ ...prev, show: false }));
    }, 3000);

    setSwitchNotification((prev) => ({ ...prev, visibilityTimeout: timeout }));
  };

  // **Cleanup Notification Timeout**
  useEffect(() => {
    return () => {
      if (switchNotification.visibilityTimeout) {
        clearTimeout(switchNotification.visibilityTimeout);
      }
    };
  }, [switchNotification.visibilityTimeout]);

  // **Auto Resize Input**
  const autoResizeInput = (target: HTMLTextAreaElement) => {
    if (!target) return;
    target.style.height = `${MIN_HEIGHT}px`;
    const scrollHeight = target.scrollHeight;
    if (scrollHeight > MIN_HEIGHT) {
      requestAnimationFrame(() => {
        target.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
      });
    }
  };

  // **Initial Resize on Mount**
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = `${MIN_HEIGHT}px`;
      const mountTimeout = setTimeout(() => {
        if (inputRef.current) {
          const scrollHeight = inputRef.current.scrollHeight;
          if (scrollHeight > MIN_HEIGHT) {
            inputRef.current.style.height = `${Math.min(scrollHeight, MAX_HEIGHT)}px`;
          }
        }
      }, 50);
      return () => clearTimeout(mountTimeout);
    }
  }, []);

  // **Resize on Input Change**
  useEffect(() => {
    if (inputRef.current) {
      const timeoutId = setTimeout(() => {
        autoResizeInput(inputRef.current!);
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [input]);

  // **Handle Input Change**
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const newValue = event.target.value;

    if (newValue.length > MAX_INPUT_CHARS) {
      setIsExceedingLimit(true);
      setInput(newValue);
      toast.error(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters.`);
    } else {
      setIsExceedingLimit(false);
      setInput(newValue);
    }

    autoResizeInput(event.target);
  };

  // **Focus and Blur Handlers**
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // **Handle Group Selection**
  const handleGroupSelect = useCallback(
    (group: SearchGroup) => {
      setSelectedGroup(group.id);
      inputRef.current?.focus();
      showSwitchNotification(group.name,`${group.description.toLowerCase()}`, <group.icon className="size-4" />);
    },
    [setSelectedGroup, inputRef],
  );

  // **Submit Handler**
  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (status !== 'ready') {
        toast.error('Please wait for the current response to complete!');
        return;
      }

      if (input.length > MAX_INPUT_CHARS) {
        toast.error(`Your input exceeds the maximum of ${MAX_INPUT_CHARS} characters. Please shorten your message.`);
        return;
      }

      if (input.trim()) {
        setHasSubmitted(true);
        handleSubmit(event);
      } else {
        toast.error('Please enter a search query.');
      }
    },
    [input, handleSubmit, status],
  );

  // **Manual Form Submission**
  const submitForm = useCallback(() => {
    onSubmit({ preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent<HTMLFormElement>);
    if (width && width > 768) {
      inputRef.current?.focus();
    }
  }, [onSubmit, width, inputRef]);

  // **Key Down Handler**
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isCompositionActive.current) {
      event.preventDefault();
      if (status === 'submitted' || status === 'streaming') {
        toast.error('Please wait for the response to complete!');
      } else {
        submitForm();
        if (width && width > 768) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    }
  };

  const isProcessing = status === 'submitted' || status === 'streaming';
  const hasInteracted = messages.length > 0;
  const isMobile = width ? width < 768 : false;

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          'relative w-full flex flex-col gap-1 rounded-lg transition-all duration-300 !font-sans',
          hasInteracted ? 'z-[51]' : '',
          'bg-transparent',
        )}
      >
        <div className="relative">
          <div className="relative w-full bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-700 focus-within:border-neutral-400 dark:focus-within:border-neutral-800">
            <Textarea
              ref={inputRef}
              placeholder={hasInteracted ? 'Ask a new question...' : 'Ask a question...'}
              value={input}
              onChange={handleInput}
              disabled={isProcessing}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                'w-full bg-transparent focus:outline-none text-lg leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-muted-foreground resize-none pt-5 pb-14 px-4 overflow-hidden',
              )}
              style={{
                minHeight: '110px',
                maxHeight: '350px',
                height: 'auto',
                overflowY: 'auto',
                userSelect: 'text',
                WebkitTapHighlightColor: 'transparent',
                transition: 'height 0.1s ease-out',
              }}
              rows={1}
              autoFocus={width ? width > 768 : true}
              onCompositionStart={() => (isCompositionActive.current = true)}
              onCompositionEnd={() => (isCompositionActive.current = false)}
              onKeyDown={handleKeyDown}
            />

            <div
              className={cn(
                'absolute bottom-0 inset-x-0 flex justify-between items-center p-2',
                isProcessing ? '!opacity-20 !cursor-not-allowed' : '',
              )}
            >
              <div
                className={cn('flex items-center gap-2', isMobile && 'overflow-hidden')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isMobile && document.activeElement === inputRef.current) {
                    inputRef.current?.blur();
                  }
                }}
              >
                <GroupSelector
                  selectedGroup={selectedGroup}
                  onGroupSelect={handleGroupSelect}
                  status={status}
                  onExpandChange={setIsGroupSelectorExpanded}
                />
              </div>

              <div
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isMobile && document.activeElement === inputRef.current) {
                    inputRef.current?.blur();
                  }
                }}
              >
                {isProcessing ? (
                  <Button
                    className="p-1.5 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      stop();
                    }}
                  >
                    <StopIcon size={14} />
                  </Button>
                ) : (
                  <Button
                    className="p-1.5 h-8 w-8 rounded-full bg-white hover:bg-neutral-100 dark:bg-white dark:hover:bg-neutral-200 text-neutral-900 dark:text-neutral-900"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      submitForm();
                    }}
                    disabled={input.length === 0 || status !== 'ready'}
                  >
                    <ArrowUpIcon size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <SwitchNotification
            icon={switchNotification.icon}
            title={switchNotification.title}
            description={switchNotification.description}
            isVisible={switchNotification.show}
          />
        </div>
      </div>
    </div>
  );
};

export default FormComponent;