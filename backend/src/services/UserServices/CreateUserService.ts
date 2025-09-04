import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Company from "../../models/Company";
import { createCostumer } from "../AsaasService/CreateCustomer";

interface Request {
  email: string;
  password: string;
  name: string;
  cpfCnpj?: string;
  queueIds?: number[];
  companyId?: number;
  profile?: string;
  whatsappId?: number;
  allTicket?:string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  companyId,
  profile = "admin",
  whatsappId,
  allTicket,
  cpfCnpj
}: Request): Promise<Response> => {
  if (companyId !== undefined) {
    const company = await Company.findOne({
      where: {
        id: companyId
      },
      include: [{ model: Plan, as: "plan" }]
    });

    if (company !== null) {
      const usersCount = await User.count({
        where: {
          companyId
        }
      });

      if (usersCount >= company.plan.users) {
        throw new AppError(
          `Número máximo de usuários já alcançado: ${usersCount}`
        );
      }
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5),
    cpfCnpj: Yup.string().optional(),

  });

  try {
    await schema.validate({ email, password, name, cpfCnpj });
  } catch (err) {
    throw new AppError(err.message);
  }

  let asaasCustomerId = null;

  if (cpfCnpj) {
    try {
      const response = await createCostumer({
        name,
        cpfCnpj: cpfCnpj
      });
      
      if (response && response.id) {
        asaasCustomerId = response.id;
        console.log("Customer created successfully:", response);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      companyId,
      profile,
      whatsappId: whatsappId || null,
      cpfCnpj,
      asaasId: asaasCustomerId,
	  allTicket
    },
    { include: ["queues", "company"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  const serializedUser = SerializeUser(user);

  return serializedUser;
};

export default CreateUserService;
