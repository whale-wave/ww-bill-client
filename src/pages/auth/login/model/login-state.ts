import { useEffect } from 'react';
import { create } from 'zustand';

type LoginType = 'email' | 'username';

const initialState = {
  userNameForm: { username: '', password: '' },
  emailForm: { email: '', emailCode: '' },
  loginType: 'username' as LoginType,
  isSubmitting: false,
  showLoading: false,
};

// The session provider remounts the login page. Keep this state in memory only
// until the last login page instance has actually left the tree.
const useLoginState = create(() => initialState);
let mountedPages = 0;
let currentSubmission: symbol | undefined;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;

function clearLoadingTimer() {
  clearTimeout(loadingTimer);
  loadingTimer = undefined;
}

export function isCurrentLoginSubmission(submission: symbol) {
  return currentSubmission === submission;
}

export function beginLoginSubmission() {
  if (currentSubmission)
    return undefined;

  currentSubmission = Symbol('login');
  useLoginState.setState({ isSubmitting: true });
  loadingTimer = setTimeout(() => {
    useLoginState.setState({ showLoading: true });
  }, 300);
  return currentSubmission;
}

export function finishLoginSubmission(submission: symbol) {
  if (!isCurrentLoginSubmission(submission))
    return;

  clearLoadingTimer();
  currentSubmission = undefined;
  useLoginState.setState({ isSubmitting: false, showLoading: false });
}

export function useLoginPageState() {
  const state = useLoginState();

  useEffect(() => {
    mountedPages += 1;
    return () => {
      mountedPages -= 1;
      queueMicrotask(() => {
        if (mountedPages !== 0)
          return;

        clearLoadingTimer();
        currentSubmission = undefined;
        useLoginState.setState(initialState);
      });
    };
  }, []);

  return {
    ...state,
    setUserNameForm: (fields: Partial<typeof initialState.userNameForm>) => useLoginState.setState(current => ({ userNameForm: { ...current.userNameForm, ...fields } })),
    setEmailForm: (fields: Partial<typeof initialState.emailForm>) => useLoginState.setState(current => ({ emailForm: { ...current.emailForm, ...fields } })),
    setLoginType: (loginType: LoginType) => useLoginState.setState({ loginType }),
  };
}
