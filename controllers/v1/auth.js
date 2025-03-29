export const role = async (req, res) => {

    const role = req.user.role

    res.json(role)
}

export const userData = async (req, res) => {

    res.send(req.user)
}