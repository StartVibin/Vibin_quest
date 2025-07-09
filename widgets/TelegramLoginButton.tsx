import { useEffect, useRef } from 'react';
import { WalletAuthUser } from "@/lib/types";

export const TelegramLoginButton = ({ onAuth }: { onAuth?: (user: WalletAuthUser) => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = '';
    // Define the global callback
    (window as any).onTelegramAuth = (user: any) => {
      if (onAuth) onAuth(user);
    };
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'MyVibinBot'); // your bot username, no @
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    ref.current?.appendChild(script);
  }, [onAuth]);

  return <div ref={ref}></div>;
}; 