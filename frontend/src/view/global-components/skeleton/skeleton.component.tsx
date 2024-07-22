import React, { FC, ReactNode } from 'react';
import { useAuthService } from "@/services/auth";
import { Link } from 'react-router-dom';
import './skeleton.component.css';

const AploseSkeleton: FC<{ children?: ReactNode }> = ({ children }) => {
    const auth = useAuthService();
    return (
        <div className="px-5 mx-5">
            <div className="row text-center">
                <div className="col-sm-12"><h1>APLOSE</h1></div>
            </div>
            <div className="row text-left h-100 main">
                <div className="col-sm-2 border rounded">
                    <ul>
                        <li><a href="/app">Back to Home</a></li>
                        <li><Link to="/datasets">Datasets</Link></li>
                        <li><Link to="/annotation-campaigns">Annotation campaigns</Link></li>
                        <br />
                        <li>
                            <button className="btn btn-secondary" onClick={auth.logout.bind(auth)}>Logout</button>
                        </li>
                    </ul>
                </div>
                {children}
            </div>
        </div>
    );
}

export default AploseSkeleton;
