import React, { Fragment, useEffect, useRef, useState } from "react";
import styles from './auth.module.scss';
import { Footer, Header } from "@/components/layout";
import { Input } from "@/components/form";
import { useAppSelector } from "@/service/app.ts";
import { AuthAPI, selectIsConnected } from "@/service/auth";
import { IonButton } from "@ionic/react";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/service/function.ts";
import { Button, Link } from "@/components/ui";
import { useToast } from "@/service/ui";
import { NON_FILTERED_KEY_DOWN_EVENT } from "@/service/events";

export const Login: React.FC = () => {

  // State
  const isConnected = useAppSelector(selectIsConnected);
  const [ username, setUsername ] = useState<string>('');
  const [ password, setPassword ] = useState<string>('');
  const [ errors, setErrors ] = useState<{ global?: string, username?: string, password?: string }>({});

  const ref = useRef<{ username: string, password: string }>({ username, password });
  useEffect(() => {
    ref.current = { username, password }
  }, [ username, password ]);

  // Service
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/annotation-campaign' } };
  const [ login, { isLoading, error: loginError } ] = AuthAPI.useLoginMutation();
  const toast = useToast()

  useEffect(() => {
    NON_FILTERED_KEY_DOWN_EVENT.add(onKbdEvent);

    return () => {
      NON_FILTERED_KEY_DOWN_EVENT.remove(onKbdEvent);
    }
  }, []);

  useEffect(() => {
    if (loginError) toast.presentError(loginError);
  }, [ loginError ]);

  useEffect(() => {
    if (isConnected) navigate(from, { replace: true });
  }, [ isConnected ]);

  function onKbdEvent(event: KeyboardEvent) {
    switch (event.code) {
      case 'Enter':
      case 'NumpadEnter':
        submit();
        break;
    }
  }

  const submit = async () => {
    setErrors({})
    if (!ref.current.username) setErrors({ username: "This field is required." })
    if (!ref.current.password) setErrors(prev => ({ ...prev, password: "This field is required." }))
    if (!ref.current.username || !ref.current.password) return;

    await login(ref.current).unwrap()
      .then(() => navigate(from, { replace: true }))
      .catch(error => setErrors({ global: getErrorMessage(error) }));
  }

  function goHome() {
    navigate('/');
  }

  return <div className={ styles.page }>
    <Header buttons={ <Fragment>
      <Button color='dark' size='large' fill='clear' onClick={ goHome }>Home</Button>
      <Link href='/' size='large'>OSmOSE</Link>
    </Fragment> }/>
    <div className={ styles.content }>
      <h2>Login</h2>

      <div className={ styles.inputs }>
        <Input id="loginInput"
               className="form-control"
               value={ username }
               onChange={ (e) => setUsername(e.target.value) }
               error={ errors.username }
               placeholder="username" label="Username" autoComplete="username"/>
        <Input id="passwordInput"
               className="form-control"
               value={ password }
               onChange={ e => setPassword(e.target.value) }
               error={ errors.password }
               placeholder="password"
               label="Password"
               type="password"
               autoComplete="current-password"/>
      </div>
      <div className={ styles.buttons }>

        <Button color='dark' fill='clear' onClick={ goHome }>Back to Home</Button>

        <IonButton color='primary' onClick={ submit }
                   disabled={ isLoading }>
          Login
        </IonButton>
      </div>
    </div>
    <Footer/>
  </div>
}