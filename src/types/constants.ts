export const USER_ROLES = {
    ADMIN: "admin",
    SALES_PERSONEL: "user",
};

export const getRoleText = (role: string) => {
    switch (role) {
        case USER_ROLES.ADMIN:
            return "Admin";
        case USER_ROLES.SALES_PERSONEL:
            return "Sales Personel";
        default:
            return "";
    }
};



export const ORDER_STATUS = {

    DRAFT: "DRAFT",
    DELIVERED: "DELIVERED",
    CANCELED: "CANCELED",
};