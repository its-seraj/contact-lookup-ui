import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface GoogleSignInButtonProps {
  className?: string;
  /**
   * Custom border radius. Can be any CSS value (e.g. '8px', '10px', '12px', '6px')
   * or a Tailwind class (e.g. 'rounded-lg', 'rounded-xl', 'rounded-md').
   * Defaults to '8px'.
   */
  radius?: string;
  text?: string;
  variant?: 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  className = '',
  radius = '8px',
  text = 'Sign in',
  variant = 'outline',
  size = 'md',
  showArrow = false,
}) => {
  const {
    googleClientId,
    loginWithGoogleIdToken,
    triggerGoogleSignIn,
    isAuthenticated,
  } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isAuthenticated || !googleClientId) return;

    let checkInterval: number;
    let attempts = 0;

    const tryRenderGoogleButton = () => {
      attempts++;
      if (typeof window !== 'undefined' && window.google?.accounts?.id && containerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential: string }) => {
              if (response?.credential) {
                await loginWithGoogleIdToken(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          containerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: size === 'lg' ? 'large' : 'medium',
            text: 'signin',
            shape: 'rectangular',
            logo_alignment: 'left',
          });

          setIsRendered(true);
          if (checkInterval) clearInterval(checkInterval);
        } catch (err) {
          console.warn('Google Sign-In button render warning:', err);
        }
      }

      if (attempts > 20 && checkInterval) {
        clearInterval(checkInterval);
      }
    };

    tryRenderGoogleButton();
    checkInterval = window.setInterval(tryRenderGoogleButton, 300);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [googleClientId, isAuthenticated, loginWithGoogleIdToken, size]);

  const isTailwindClass = radius.startsWith('rounded');
  const computedBorderRadius = isTailwindClass ? undefined : radius;

  const isPrimary = variant === 'primary';
  const sizeClasses =
    size === 'lg'
      ? 'h-12 px-6 text-sm font-semibold'
      : size === 'sm'
      ? 'h-8 px-3 text-xs'
      : 'h-9 px-3.5 text-xs';

  const baseStyleClasses = isPrimary
    ? 'bg-primary-container text-on-primary hover:bg-primary shadow-md hover:shadow-lg border-0'
    : 'border border-surface-container hover:border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-on-surface';

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none group ${sizeClasses} ${baseStyleClasses} ${
        isTailwindClass ? radius : ''
      } ${className}`}
      style={{
        borderRadius: computedBorderRadius,
        minHeight: size === 'lg' ? '48px' : size === 'sm' ? '32px' : '36px',
      }}
      onClick={!isRendered ? triggerGoogleSignIn : undefined}
      title="Sign in with Google"
    >
      {/* Visible custom button styling with customizable radius */}
      <div className="flex items-center gap-2 pointer-events-none">
        {isPrimary ? (
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span
          className={`font-label-md ${
            isPrimary ? 'text-on-primary font-semibold' : 'text-on-surface font-medium'
          } whitespace-nowrap`}
        >
          {text}
        </span>
        {showArrow && (
          <span
            className={`material-symbols-outlined text-[18px] ${
              isPrimary ? 'text-on-primary' : 'text-primary'
            }`}
          >
            arrow_forward
          </span>
        )}
      </div>

      {/* Official Google button rendered as transparent overlay to handle real auth popup */}
      <div
        ref={containerRef}
        className={`absolute inset-0 opacity-0 cursor-pointer overflow-hidden flex items-center justify-center ${
          isRendered ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          transform: size === 'lg' ? 'scale(1.5)' : 'scale(1.25)',
          transformOrigin: 'center',
        }}
      />
    </div>
  );
};
