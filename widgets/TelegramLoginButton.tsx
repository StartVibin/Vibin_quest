import React, { useEffect } from 'react';

export const TelegramLoginButton = () => {
  useEffect(() => {
    (window as any).onTelegramAuth = function(user: any) {
      alert('Logged in as ' + user.first_name + ' ' + user.last_name + ' (' + user.id + (user.username ? ', @' + user.username : '') + ')');
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="MyVibinBot" data-size="large" data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
        `
      }}
    />
  );
}; 