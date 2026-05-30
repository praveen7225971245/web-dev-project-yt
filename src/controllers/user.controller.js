import {asyncHandlers} from '../utils/asyncHandlers.js';


export const registerUser = asyncHandlers(async (req, res) => {
    res.status(201).json({message: 'ok'});
});