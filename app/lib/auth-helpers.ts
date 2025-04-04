export const isAdmin = (username: string) => username === 'yasin';

export const isModerator = async (username: string, db: any) => {
    const user = await db.collection('users').findOne({ username });
    return user?.role === 'moderator' || isAdmin(username);
};

export const canModifyUser = async (actorUsername: string, targetUsername: string, db: any) => {
    // Admins can modify anyone
    if (isAdmin(actorUsername)) return true;

    // Moderators can't modify admins
    if (isAdmin(targetUsername)) return false;

    // Moderators can modify regular users
    const isMod = await isModerator(actorUsername, db);
    return isMod;
};
