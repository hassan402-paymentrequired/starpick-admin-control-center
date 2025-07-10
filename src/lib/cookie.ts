import Cookies from 'js-cookie';

export function setCookie(name, data) {
    Cookies.set(name, data, {
        secure: true,
    });
}

export function setTokenAndUser(token: string, user) {
    setCookie('_token', token)
    setCookie('_user', user)
}

export function removeTokenAndUser() {
    removeCookie('_token')
    removeCookie('_user')
}

export function getCookie(name) {
    return Cookies.get(name);
}

export function removeCookie(name) {
    Cookies.remove(name)
}