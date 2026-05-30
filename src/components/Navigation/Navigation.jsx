import './Navigation.css';
import { NavLink } from 'react-router-dom';

function Navigation() {
    return (
        <nav className="Navigation">
            <div className='spacer'></div>
            <h1 className='Navigation-title'>PlateScout</h1>
            <ul>
                <li>
                    <NavLink className="Navigation-login" to="/login">Log in</NavLink>
                </li>
                <li>
                    <NavLink className="Navigation-signup" to="/signup">Sign up</NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
