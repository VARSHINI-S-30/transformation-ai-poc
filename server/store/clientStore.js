const clients = new Map();
export const saveClients = (clientList) => {
    clients.clear();
    clientList.forEach((client) => {
        clients.set(Number(client.client_id),client);
    });
    return clients.size;
};
export const getAllClients = () => {
    return Array.from(clients.values());
};
export const getClientById = (clientId) => {
    return clients.get(Number(clientId)) || null;
};
export const searchClients = (searchTerm) => {
    const search = searchTerm.toLowerCase();
    return getAllClients().filter((client) => {
        return [
            client.name,
            client.primary_goal_1,
            client.primary_goal_2,
            client.secondary_goal_1,
            client.secondary_goal_2,
            client.activity_level
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(search)
        );
    });
};
export const getClientCount = () => {
    return clients.size;
};
