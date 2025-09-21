'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { authenticateWithPassword } from './actions';

const initialState = {
  status: 'idle',
  message: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button button--primary" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function CredentialsLoginForm({ redirectTo }) {
  const [state, formAction] = useActionState(authenticateWithPassword, initialState);

  return (
    <form action={formAction} className="login-form">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <label className="login-form__label" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        placeholder="you@oleksiyk.com"
        className="login-form__input"
        autoComplete="email"
      />
      <label className="login-form__label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        placeholder="Your password"
        className="login-form__input"
        autoComplete="current-password"
      />
      <p className="login-form__hint">
        Accounts are provisioned ahead of time. Use your email and password to establish the shared Supabase session
        for every app under <code>.oleksiyk.com</code>.
      </p>
      <SubmitButton />
      {state.message ? (
        <p
          className={
            state.status === 'error'
              ? 'login-form__feedback login-form__feedback--error'
              : 'login-form__feedback login-form__feedback--success'
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
