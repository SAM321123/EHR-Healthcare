/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-new */

const { errorMessages } = require('../config/error');
const { roles } = require('../config/roles');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');

const userCheck = () => {
    return async (req, res, next) => {
        try {
            const uuid = req.clinicUuid;
            const { body } = req;

            const db = getModels(uuid);

            const user = await dbService.getOne({
                model: db.User,
                filter: { where: { email: body?.email, isBlocked: true } },
                include: [{ model: db.Role, as: 'roles' }]
            })
            if (user?.roles?.some((item) => item.code !== roles.CLINIC_ADMIN && item.code !== roles.SUPER_ADMIN) && user
            ) {
                return res.status(403).json({ message: errorMessages.USER_BLOCKED });
            }
            next();
        } catch (error) {
            console.error('Error in userCheck:', error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
}

module.exports = userCheck;