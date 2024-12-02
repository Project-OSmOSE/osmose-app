import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { OldInput, InputValue } from "@/components/form/inputs/input.tsx";
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { InputRef } from "@/components/form/inputs/utils.ts";
import { useLoginMutation, selectIsConnected } from '@/service/auth';
import { useAppSelector } from '@/slices/app.ts';
import { getErrorMessage } from '@/service/function.ts';


export const Login: React.FC = () => {
  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/annotation-campaign' } };
  const inputsRef = useRef<{ [key in 'username' | 'password']: InputRef<InputValue> | null }>({
    username: null,
    password: null
  });

  // State
  const isConnected = useAppSelector(selectIsConnected);
  const [ errorMessage, setErrorMessage ] = useState<string | undefined>();

  // Service
  const [ login, { isLoading } ] = useLoginMutation();

  useEffect(() => {
    if (isConnected) history.replace(from);
  }, [isConnected]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = inputsRef.current.username?.validate()?.toString().trim();
    if (!username) {
      inputsRef.current.username?.setError("This field is required.")
    }
    const password = inputsRef.current.password?.validate()?.toString().trim();
    if (!username) {
      inputsRef.current.username?.setError("This field is required.")
    }
    if (!username || !password) return;

    await login({ username, password })
      .unwrap()
      .then(() => history.replace(from))
      .catch(error => {
        setErrorMessage(getErrorMessage(error))
      });
  }

  return (
    <div className="container">
      <div className="row text-left h-100 main">
        <div className="col-sm-12 border rounded">
          <h1 className="text-center">Login</h1>
          { errorMessage && <p className="error-message">{ errorMessage }</p> }
          <form onSubmit={ handleSubmit }>
            <div className="form-group">
              <OldInput id="loginInput" className="form-control"
                        ref={ el => inputsRef.current.username = el }
                        placeholder="username" label="Login" autoComplete="username"/>
            </div>
            <div className="form-group">
              <OldInput id="passwordInput" className="form-control" ref={ el => inputsRef.current.password = el }
                        placeholder="password" label="Password"
                        type="password" autoComplete="current-password"/>
            </div>

            <IonButton color={ "primary" }
                       disabled={ isLoading }
                       type={ "submit" }>
              Submit
            </IonButton>
          </form>
        </div>
      </div>

      <Link to="/">Back to Home</Link>

      <OsmoseBarComponent/>
    </div>
  )
}

