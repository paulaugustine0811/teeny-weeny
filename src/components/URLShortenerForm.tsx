
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createShortUrl, getFullShortUrl, isValidUrl, isValidCustomCode, isCustomCodeAvailable } from "@/utils/shortener";
import { motion } from "framer-motion";
import { CopyIcon, CheckIcon, ExternalLinkIcon, TimerIcon, ClockIcon, ChevronDownIcon } from "lucide-react";

const URLShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [customCodeEnabled, setCustomCodeEnabled] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationType, setExpirationType] = useState("days");
  const [expirationValue, setExpirationValue] = useState("7");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    // Add http:// prefix if not included
    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    
    if (!isValidUrl(processedUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // Validate custom code if enabled
    if (customCodeEnabled) {
      if (!customCode) {
        toast.error("Please enter a custom code");
        return;
      }
      
      if (!isValidCustomCode(customCode)) {
        toast.error("Custom code can only contain letters, numbers, hyphens and underscores");
        return;
      }
      
      if (!isCustomCodeAvailable(customCode)) {
        toast.error("This custom code is already in use");
        return;
      }
    }
    
    setIsLoading(true);
    
    // Calculate expiration date if enabled
    let expiresAt: number | null = null;
    if (expirationEnabled) {
      const value = parseInt(expirationValue);
      
      if (isNaN(value) || value <= 0) {
        toast.error("Please enter a valid expiration value");
        setIsLoading(false);
        return;
      }
      
      const now = Date.now();
      switch (expirationType) {
        case "minutes":
          expiresAt = now + (value * 60 * 1000);
          break;
        case "hours":
          expiresAt = now + (value * 60 * 60 * 1000);
          break;
        case "days":
          expiresAt = now + (value * 24 * 60 * 60 * 1000);
          break;
        default:
          expiresAt = null;
      }
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const result = createShortUrl(processedUrl, {
          customCode: customCodeEnabled ? customCode : undefined,
          expiresAt
        });
        
        const fullShortUrl = getFullShortUrl(result.shortCode);
        setShortUrl(fullShortUrl);
        toast.success("URL shortened successfully!");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to shorten URL");
        }
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const copyToClipboard = () => {
    if (!shortUrl) return;
    
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };
  
  const resetForm = () => {
    setUrl("");
    setShortUrl(null);
    setAdvancedOptions(false);
    setCustomCodeEnabled(false);
    setCustomCode("");
    setExpirationEnabled(false);
    setExpirationType("days");
    setExpirationValue("7");
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      {!shortUrl ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pr-24 h-14 text-base bg-white/5 shadow-sm"
                placeholder="Enter your long URL"
                type="text"
              />
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="absolute right-1 top-1 h-12"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Shortening
                  </div>
                ) : "Shorten URL"}
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => setAdvancedOptions(!advancedOptions)}
              >
                {advancedOptions ? "Hide" : "Show"} advanced options
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${advancedOptions ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {advancedOptions && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-xl p-4 space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="custom-code" 
                        checked={customCodeEnabled} 
                        onCheckedChange={setCustomCodeEnabled} 
                      />
                      <Label htmlFor="custom-code">Custom slug</Label>
                    </div>
                  </div>
                  
                  {customCodeEnabled && (
                    <div className="pt-2">
                      <Input
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder="Enter your custom slug (e.g., sale)"
                        className="bg-white/5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your URL will be: {window.location.origin}/r/<span className="text-primary">{customCode || 'sale'}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="expiration" 
                        checked={expirationEnabled} 
                        onCheckedChange={setExpirationEnabled} 
                      />
                      <Label htmlFor="expiration">Set expiration time</Label>
                    </div>
                  </div>
                  
                  {expirationEnabled && (
                    <div className="pt-2 flex space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={expirationValue}
                        onChange={(e) => setExpirationValue(e.target.value)}
                        className="bg-white/5 w-20"
                      />
                      
                      <Select value={expirationType} onValueChange={setExpirationType}>
                        <SelectTrigger className="bg-white/5 w-32">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-6 rounded-xl space-y-4"
        >
          <div className="flex flex-col space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Your shortened URL:</div>
            <div className="flex items-center">
              <div className="bg-secondary/50 p-3 rounded-l-md border-y border-l border-border overflow-hidden overflow-ellipsis whitespace-nowrap flex-1">
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-medium hover:underline"
                >
                  {shortUrl}
                </a>
              </div>
              <Button 
                onClick={copyToClipboard} 
                size="icon" 
                variant="default" 
                className="rounded-l-none rounded-r-md h-[46px]"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline" 
              className="flex-1"
              onClick={resetForm}
            >
              Shorten Another
            </Button>
            
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => {
                window.open(shortUrl, '_blank');
              }}
            >
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Visit URL
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default URLShortenerForm;
