import './App.css';
import { Link } from 'react-router';

export function Donate(){
    return (
        <div>
            <header>
                <Link to="/"><img src="fabricait.png" alt="Frabricate logo"/></Link>
                <ul>
                    <li><Link to="/results">How It Works</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/donate">Donate</Link></li>
                </ul>
            </header>
            <div>
                <h1>Donate</h1>
            </div>
        </div>
    )
}