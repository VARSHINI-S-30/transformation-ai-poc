import {
    getAllClients,getClientById,searchClients,getClientCount
} from "../store/clientStore.js";

export const getClients = (req, res) => {
    try {
        const search = req.query.search?.trim();
        const clients = search
            ? searchClients(search)
            : getAllClients();
        return res.status(200).json({
            success: true,
            totalClients: clients.length,
            clients
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }};

export const getClientDetails = (req, res) => {
    try {
        const clientId = Number(req.params.id);
        if (!Number.isInteger(clientId) || clientId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid client ID"
            });
        }
        const client = getClientById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Client details retrieved successfully",
            client
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }};

export const getClientSummary = (req, res) => {
    return res.status(200).json({
        success: true,
        totalClients: getClientCount()
    });
};
