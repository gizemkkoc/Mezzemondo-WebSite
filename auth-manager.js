class AuthManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; 
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }
    createAccount(username, email, password) {
        if (this.users.some(user => user.email === email)) {
            throw new Error('Email already exists');
        }

        const user = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password)
        };

        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        return user;
    }
    signIn(email, password, rememberMe = false) {
        const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));
        
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const session = {
            userId: user.id,
            username: user.username,
            email: user.email,
            expires: Date.now() + this.sessionTimeout
        };

        sessionStorage.setItem('currentSession', JSON.stringify(session));

        if (rememberMe) {
            const token = this.generateToken();
            const cookieExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
            this.setCookie('authToken', token, cookieExpiry);
            this.setCookie('userEmail', email, cookieExpiry);
        }
        return user;
    }

    checkSession() {
        const session = JSON.parse(sessionStorage.getItem('currentSession'));
        if (!session) {
            const authToken = this.getCookie('authToken');
            const userEmail = this.getCookie('userEmail');
            
            if (authToken && userEmail) {
                const user = this.users.find(u => u.email === userEmail);
                if (user) {
                    return this.signIn(userEmail, user.password, true);
                }
            }
            return null;
        }

        if (Date.now() > session.expires) {
            this.signOut();
            return null;
        }

        return session;
    }
    signOut() {
        sessionStorage.removeItem('currentSession');
        this.deleteCookie('authToken');
        this.deleteCookie('userEmail');
    }

   
    hashPassword(password) {
        
        return btoa(password);
    }

    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    setCookie(name, value, expires) {
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    }

    getCookie(name) {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
}
const authManager = new AuthManager();
document.getElementById('createAccountForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const user = authManager.createAccount(username, email, password);
        window.location.href = '/login.html';
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
        const user = authManager.signIn(email, password, rememberMe);
        window.location.href = '/index.html';
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const session = authManager.checkSession();
    if (!session && window.location.pathname !== '/login.html' && 
        window.location.pathname !== '/register.html') {
        window.location.href = '/login.html';
    }
});