import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { Input, InputValue } from "@/components/form/inputs/input.tsx";
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { InputRef } from "@/components/form/inputs/utils.ts";
import { useLoginMutation, selectIsConnected } from '@/service/auth';
import { useAppSelector } from '@/slices/app.ts';


export const Login: React.FC = () => {
  const [ error, setError ] = useState<string | undefined>();

  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/annotation-campaign' } };
  const inputsRef = useRef<{ [key in 'username' | 'password']: InputRef<InputValue> | null }>({
    username: null,
    password: null
  });

  // State
  const isConnected = useAppSelector(selectIsConnected);

  // Service
  const [ login, { isLoading } ] = useLoginMutation()

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
    setError(undefined);

    try {
      await login({ username, password }).unwrap()
      history.replace(from);
    } catch (e: any) {
      setError(e)
    }
  }

  return (
    <div className="container">
      <div className="row text-left h-100 main">
        <div className="col-sm-12 border rounded">
          <h1 className="text-center">Login</h1>
          { error && <p className="error-message">{ error }</p> }
          <form onSubmit={ handleSubmit }>
            <div className="form-group">
              <Input id="loginInput" className="form-control"
                     ref={ el => inputsRef.current.username = el }
                     placeholder="username" label="Login" autoComplete="username"/>
            </div>
            <div className="form-group">
              <Input id="passwordInput" className="form-control" ref={ el => inputsRef.current.password = el }
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

