"use client";;
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { createContext, useContext, useState } from "react";

const EnvironmentVariablesContext =
  createContext({
    showValues: false,
    setShowValues: () => undefined,
  });

export const EnvironmentVariables = ({
  showValues: controlledShowValues,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  children,
  ...props
}) => {
  const [internalShowValues, setInternalShowValues] =
    useState(defaultShowValues);
  const showValues = controlledShowValues ?? internalShowValues;

  const setShowValues = (show) => {
    setInternalShowValues(show);
    onShowValuesChange?.(show);
  };

  return (
    <EnvironmentVariablesContext.Provider value={{ showValues, setShowValues }}>
      <div className={cn("rounded-lg border bg-background", className)} {...props}>
        {children}
      </div>
    </EnvironmentVariablesContext.Provider>
  );
};

export const EnvironmentVariablesHeader = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("flex items-center justify-between border-b px-4 py-3", className)}
    {...props}>
    {children}
  </div>
);

export const EnvironmentVariablesTitle = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn("font-medium text-sm", className)} {...props}>
    {children ?? "Environment Variables"}
  </h3>
);

export const EnvironmentVariablesToggle = ({
  className,
  ...props
}) => {
  const { showValues, setShowValues } = useContext(EnvironmentVariablesContext);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs">
        {showValues ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
      </span>
      <Switch
        aria-label="Toggle value visibility"
        checked={showValues}
        onCheckedChange={setShowValues}
        {...props} />
    </div>
  );
};

export const EnvironmentVariablesContent = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

const EnvironmentVariableContext =
  createContext({
    name: "",
    value: "",
  });

export const EnvironmentVariable = ({
  name,
  value,
  className,
  children,
  ...props
}) => (
  <EnvironmentVariableContext.Provider value={{ name, value }}>
    <div
      className={cn("flex items-center justify-between gap-4 px-4 py-3", className)}
      {...props}>
      {children ?? (
        <>
          <div className="flex items-center gap-2">
            <EnvironmentVariableName />
          </div>
          <EnvironmentVariableValue />
        </>
      )}
    </div>
  </EnvironmentVariableContext.Provider>
);

export const EnvironmentVariableGroup = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export const EnvironmentVariableName = ({
  className,
  children,
  ...props
}) => {
  const { name } = useContext(EnvironmentVariableContext);

  return (
    <span className={cn("font-mono text-sm", className)} {...props}>
      {children ?? name}
    </span>
  );
};

export const EnvironmentVariableValue = ({
  className,
  children,
  ...props
}) => {
  const { value } = useContext(EnvironmentVariableContext);
  const { showValues } = useContext(EnvironmentVariablesContext);

  const displayValue = showValues
    ? value
    : "•".repeat(Math.min(value.length, 20));

  return (
    <span
      className={cn(
        "font-mono text-muted-foreground text-sm",
        !showValues && "select-none",
        className
      )}
      {...props}>
      {children ?? displayValue}
    </span>
  );
};

export const EnvironmentVariableCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  copyFormat = "value",
  children,
  className,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { name, value } = useContext(EnvironmentVariableContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    let textToCopy = value;
    if (copyFormat === "name") {
      textToCopy = name;
    } else if (copyFormat === "export") {
      textToCopy = `export ${name}="${value}"`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("size-6 shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}>
      {children ?? <Icon size={12} />}
    </Button>
  );
};

export const EnvironmentVariableRequired = ({
  className,
  children,
  ...props
}) => (
  <Badge className={cn("text-xs", className)} variant="secondary" {...props}>
    {children ?? "Required"}
  </Badge>
);
