import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from "react-router-dom";
import { IonButton } from "@ionic/react";
import { Input } from "@/components/form/inputs/input.tsx";
import { selectIsConnected, useLoginMutation } from '@/service/auth';
import { useAppSelector } from '@/service/app';
import { getErrorMessage } from '@/service/function.ts';
import { OSmOSEFooter } from "@/components/new-layout";


export const Login: React.FC = () => {

  // State
  const isConnected = useAppSelector(selectIsConnected);
  const [ username, setUsername ] = useState<string>('');
  const [ password, setPassword ] = useState<string>('');
  const [ errors, setErrors ] = useState<{ global?: string, username?: string, password?: string }>({});

  // Service
  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/annotation-campaign' } };

  // Service
  const [ login, { isLoading } ] = useLoginMutation();

  useEffect(() => {
    if (isConnected) history.replace(from);
  }, [ isConnected ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({})
    if (!username) setErrors({ username: "This field is required." })
    if (!password) setErrors(prev => ({ ...prev, password: "This field is required." }))
    if (!username || !password) return;

    await login({ username, password })
      .unwrap()
      .then(() => history.replace(from))
      .catch(error => setErrors({ global: getErrorMessage(error) }));
  }

  return (
    <div className="container">
      <div className="row text-left h-100 main">
        <div className="col-sm-12 border rounded">
          <h1 className="text-center">Login</h1>
          { errors.global && <p className="error-message">{ errors.global }</p> }
          <form onSubmit={ handleSubmit }>
            <div className="form-group">
              <Input id="loginInput"
                     className="form-control"
                     value={ username }
                     onChange={ (e) => setUsername(e.target.value) }
                     error={ errors.username }
                     placeholder="username" label="Login" autoComplete="username"/>
            </div>
            <div className="form-group">
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

            <IonButton color={ "primary" }
                       disabled={ isLoading }
                       type={ "submit" }>
              Submit
            </IonButton>
          </form>
        </div>
      </div>

      <Link to="/">Back to Home</Link>

      <OSmOSEFooter/>
    </div>
  )
}

