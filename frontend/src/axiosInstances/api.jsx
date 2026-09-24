import axios from 'axios'

const baseURL = 'http://localhost:5000/api'

const api = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    withCredentials: true   // send cookies with every request
})

export default api