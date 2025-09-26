import { Request, Response } from "express";
import Partner from "../models/Partner";
import Company from "../models/Company";
import Plan from "../models/Plan";
import Invoices from "../models/Invoices";
import User from "../models/User";
import jwt from "jsonwebtoken";
import authConfig from "../config/auth";
import { hash, compare } from "bcryptjs";

// Constante para o período de trial em dias
const TRIAL_PERIOD_DAYS = 3;

export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const partners = await Partner.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Company,
          as: "companies"
        }
      ]
    });

    return res.json(partners);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      nome,
      email,
      cpfCpnj,
      urlParceiro,
      telefone,
      walletId,
      porcentagemComissao
    } = req.body;

    // Hashear a senha padrão
    const passwordHash = await hash("123456parceirozaplia", 8);

    const partner = await Partner.create({
      nome,
      email,
      cpfCpnj,
      urlParceiro,
      telefone,
      status: "Sim", // Status padrão
      password: passwordHash, // Senha hasheada
      criadoEm: new Date(),
      walletId,
      porcentagemComissao
    });

    return res.status(201).json(partner);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar parceiro" });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByPk(id, {
      include: [
        {
          model: Company,
          as: "companies",
          attributes: ["id", "name", "status", "email", "phone"]
        }
      ]
    });

    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    return res.json(partner);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      nome,
      email,
      cpfCpnj,
      urlParceiro,
      telefone,
      walletId,
      porcentagemComissao
    } = req.body;

    const partner = await Partner.findByPk(id);

    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    await partner.update({
      nome,
      email,
      cpfCpnj,
      urlParceiro,
      telefone,
      walletId,
      porcentagemComissao
    });

    return res.json(partner);
  } catch (error) {
    return res.status(400).json({ error: "Erro ao atualizar parceiro" });
  }
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const partner = await Partner.findByPk(id);

    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    await partner.destroy();

    return res.json({ message: "Parceiro excluído com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const associateCompany = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { partnerId, companyId } = req.body;

    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    await company.update({ partnerId });

    return res.json({ message: "Empresa associada ao parceiro com sucesso" });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Erro ao associar empresa ao parceiro" });
  }
};

export const disassociateCompany = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { companyId } = req.params;

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    await company.update({ partnerId: null });

    return res.json({
      message: "Empresa desassociada do parceiro com sucesso"
    });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Erro ao desassociar empresa do parceiro" });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    // Primeiro, buscar parceiro pelo email
    const partner = await Partner.findOne({
      where: { email },
      include: [
        {
          model: Company,
          as: "companies",
          attributes: ["id", "name", "status"]
        }
      ]
    });

    if (partner) {
      // Verificar senha usando bcrypt para partner
      const isPasswordValid = await compare(password, partner.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Gerar token JWT para o parceiro
      const token = jwt.sign(
        {
          id: partner.id,
          email: partner.email,
          nome: partner.nome,
          type: "partner"
        },
        authConfig.secret,
        {
          expiresIn: "30d"
        }
      );

      return res.json({
        token,
        partner: {
          id: partner.id,
          nome: partner.nome,
          email: partner.email,
          companies: partner.companies,
          type: "partner"
        }
      });
    }

    // Se não encontrou partner, tentar buscar na tabela User
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Verificar senha usando bcrypt para user
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token JWT para o usuário
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.name,
        type: "user"
      },
      authConfig.secret,
      {
        expiresIn: "30d"
      }
    );

    return res.json({
      token,
      partner: {
        id: user.id,
        nome: user.name,
        email: user.email,
        profile: user.profile,
        type: "user"
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Senha atual e nova senha são obrigatórias" });
    }

    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await compare(
      currentPassword,
      partner.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Hashear nova senha
    const newPasswordHash = await hash(newPassword, 8);

    // Atualizar senha
    await partner.update({ password: newPasswordHash });

    return res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getMyCompanies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Extrair informações do token JWT
    const { id: partnerId } = req.user as any;

    // Buscar o parceiro para verificar se existe
    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    // Buscar todas as empresas indicadas por este parceiro
    const companies = await Company.findAll({
      where: { partnerId },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "status",
        "cpfCnpj",
        "dueDate",
        "createdAt"
      ],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "value", "users", "connections", "queues"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Buscar todas as faturas para as empresas do parceiro
    const companyIds = companies.map(company => company.id);
    const invoicesData = await Invoices.findAll({
      where: { companyId: companyIds },
      attributes: ["companyId", "id", "status", "value", "createdAt", "dueDate"]
    });

    // Criar um mapa para facilitar o lookup de faturas por empresa
    const invoicesByCompany = invoicesData.reduce((acc, invoice) => {
      if (!acc[invoice.companyId]) {
        acc[invoice.companyId] = [];
      }
      acc[invoice.companyId].push(invoice);
      return acc;
    }, {} as Record<number, any[]>);

    // Adicionar informação sobre trial/assinado baseado em faturas
    const companiesWithPlanStatus = companies.map(company => {
      const now = new Date();
      const createdAt = new Date(company.createdAt);
      const dueDate = new Date(company.dueDate);

      // Calcular métricas de tempo
      const daysSinceCreation = Math.ceil(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysUntilExpiry = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = dueDate < now;

      // Nova lógica baseada em faturas:
      // Se a empresa tem pelo menos uma fatura PAGA, é considerada subscribed
      // Se tem apenas faturas ABERTAS (open), verifica se a primeira fatura ainda está em trial (3 dias)
      // Se não tem faturas, é trial (mas apenas se ainda está dentro do período trial e não expirou)
      const companyInvoices = invoicesByCompany[company.id] || [];
      const paidInvoices = companyInvoices.filter(
        invoice => invoice.status === "PAID"
      );
      const openInvoices = companyInvoices.filter(
        invoice => invoice.status === "open"
      );

      let isTrial = false;
      let isSubscribed = false;

      if (paidInvoices.length > 0) {
        // Empresa tem faturas pagas, logo é subscribed
        isSubscribed = true;
      } else if (openInvoices.length > 0) {
        // Empresa tem apenas faturas abertas, verificar se a primeira ainda está em trial
        const firstOpenInvoice = openInvoices.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
        const invoiceCreatedAt = new Date(firstOpenInvoice.createdAt);
        const daysSinceFirstInvoice = Math.ceil(
          (now.getTime() - invoiceCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceFirstInvoice <= 3) {
          // Primeira fatura open ainda está dentro de 3 dias
          isTrial = true;
        } else {
          // Primeira fatura open passou de 3 dias, não é mais trial nem subscribed
          isTrial = false;
          isSubscribed = false;
        }
      } else {
        // Empresa não tem faturas, verifica se ainda está em trial
        if (!isExpired && daysSinceCreation <= TRIAL_PERIOD_DAYS) {
          isTrial = true;
        }
        // Se expirou ou passou do período trial sem faturas, não é nem trial nem subscribed
      }

      // Status do plano
      const planStatus = {
        isTrial,
        isSubscribed,
        daysSinceCreation,
        daysUntilExpiry,
        isExpired,
        totalInvoices: companyInvoices.length,
        paidInvoices: paidInvoices.length,
        openInvoices: openInvoices.length
      };

      return {
        ...company.toJSON(),
        planStatus
      };
    });

    return res.json({
      partner: {
        id: partner.id,
        nome: partner.nome,
        email: partner.email
      },
      companies: companiesWithPlanStatus,
      total: companiesWithPlanStatus.length
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getMyCompaniesStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Extrair informações do token JWT
    const { id: partnerId } = req.user as any;

    // Buscar o parceiro para verificar se existe
    const partner = await Partner.findByPk(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Parceiro não encontrado" });
    }

    // Buscar estatísticas das empresas
    const companies = await Company.findAll({
      where: { partnerId },
      attributes: ["id", "status", "createdAt", "dueDate"],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "value"]
        }
      ]
    });

    // Buscar todas as faturas para as empresas do parceiro
    const companyIds = companies.map(company => company.id);
    const invoicesData = await Invoices.findAll({
      where: { companyId: companyIds },
      attributes: ["companyId", "id", "status", "value", "createdAt", "dueDate"]
    });

    // Criar um mapa para facilitar o lookup de faturas por empresa
    const invoicesByCompany = invoicesData.reduce((acc, invoice) => {
      if (!acc[invoice.companyId]) {
        acc[invoice.companyId] = [];
      }
      acc[invoice.companyId].push(invoice);
      return acc;
    }, {} as Record<number, any[]>);

    // Calcular valor total dos planos e estatísticas de trial/assinado
    let totalValue = 0;
    let trialCount = 0;
    let subscribedCount = 0;
    let expiredCount = 0;

    companies.forEach(company => {
      totalValue += company.plan?.value || 0;

      const now = new Date();
      const createdAt = new Date(company.createdAt);
      const dueDate = new Date(company.dueDate);

      // Calcular métricas de tempo
      const daysSinceCreation = Math.ceil(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = dueDate < now;

      // Nova lógica baseada em faturas (mesma do getMyCompanies)
      const companyInvoices = invoicesByCompany[company.id] || [];
      const paidInvoices = companyInvoices.filter(
        invoice => invoice.status === "PAID"
      );
      const openInvoices = companyInvoices.filter(
        invoice => invoice.status === "open"
      );

      let isTrial = false;
      let isSubscribed = false;

      if (paidInvoices.length > 0) {
        // Empresa tem faturas pagas, logo é subscribed
        isSubscribed = true;
      } else if (openInvoices.length > 0) {
        // Empresa tem apenas faturas abertas, verificar se a primeira ainda está em trial
        const firstOpenInvoice = openInvoices.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
        const invoiceCreatedAt = new Date(firstOpenInvoice.createdAt);
        const daysSinceFirstInvoice = Math.ceil(
          (now.getTime() - invoiceCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceFirstInvoice <= 3) {
          // Primeira fatura open ainda está dentro de 3 dias
          isTrial = true;
        } else {
          // Primeira fatura open passou de 3 dias, não é mais trial nem subscribed
          isTrial = false;
          isSubscribed = false;
        }
      } else {
        // Empresa não tem faturas, verifica se ainda está em trial
        if (!isExpired && daysSinceCreation <= TRIAL_PERIOD_DAYS) {
          isTrial = true;
        }
        // Se expirou ou passou do período trial sem faturas, não é nem trial nem subscribed
      }

      if (isExpired && paidInvoices.length === 0) {
        expiredCount++;
      } else if (isTrial) {
        trialCount++;
      } else if (isSubscribed) {
        subscribedCount++;
      }
    });

    const stats = {
      total: companies.length,
      active: companies.filter(c => c.status === true).length,
      inactive: companies.filter(c => c.status === false).length,
      thisMonth: companies.filter(c => {
        const companyDate = new Date(c.createdAt);
        const now = new Date();
        return (
          companyDate.getMonth() === now.getMonth() &&
          companyDate.getFullYear() === now.getFullYear()
        );
      }).length,
      totalValue: totalValue,
      averageValue: companies.length > 0 ? totalValue / companies.length : 0,
      trial: trialCount,
      subscribed: subscribedCount,
      expired: expiredCount
    };

    return res.json({
      partner: {
        id: partner.id,
        nome: partner.nome,
        email: partner.email
      },
      stats
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getAllReferredCompanies = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Condições de busca
    const whereCondition: any = {
      partnerId: { [require("sequelize").Op.not]: null } // Apenas empresas com parceiro
    };

    if (search) {
      whereCondition[require("sequelize").Op.or] = [
        { name: { [require("sequelize").Op.iLike]: `%${search}%` } },
        { email: { [require("sequelize").Op.iLike]: `%${search}%` } },
        {
          "$partner.nome$": { [require("sequelize").Op.iLike]: `%${search}%` }
        },
        {
          "$partner.email$": { [require("sequelize").Op.iLike]: `%${search}%` }
        }
      ];
    }

    // Buscar empresas com parceiros
    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "status",
        "cpfCnpj",
        "dueDate",
        "createdAt"
      ],
      include: [
        {
          model: Partner,
          as: "partner",
          attributes: ["id", "nome", "email", "telefone"],
          required: true
        },
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "value", "users", "connections", "queues"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
      distinct: true
    });

    // Buscar todas as faturas para as empresas encontradas
    const companyIds = companies.map(company => company.id);
    const invoicesData = await Invoices.findAll({
      where: { companyId: companyIds },
      attributes: ["companyId", "id", "status", "value", "createdAt", "dueDate"]
    });

    // Criar um mapa para facilitar o lookup de faturas por empresa
    const invoicesByCompany = invoicesData.reduce((acc, invoice) => {
      if (!acc[invoice.companyId]) {
        acc[invoice.companyId] = [];
      }
      acc[invoice.companyId].push(invoice);
      return acc;
    }, {} as Record<number, any[]>);

    // Adicionar informação sobre trial/assinado baseado em faturas
    const companiesWithDetails = companies.map(company => {
      const now = new Date();
      const createdAt = new Date(company.createdAt);
      const dueDate = new Date(company.dueDate);

      // Calcular métricas de tempo
      const daysSinceCreation = Math.ceil(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysUntilExpiry = Math.ceil(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = dueDate < now;

      // Mesma lógica de trial/subscribed do getMyCompanies
      const companyInvoices = invoicesByCompany[company.id] || [];
      const paidInvoices = companyInvoices.filter(
        invoice => invoice.status === "PAID"
      );
      const openInvoices = companyInvoices.filter(
        invoice => invoice.status === "open"
      );

      let isTrial = false;
      let isSubscribed = false;
      let planStatus = "expired";

      if (paidInvoices.length > 0) {
        isSubscribed = true;
        planStatus = "subscribed";
      } else if (openInvoices.length > 0) {
        const firstOpenInvoice = openInvoices.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];
        const invoiceCreatedAt = new Date(firstOpenInvoice.createdAt);
        const daysSinceFirstInvoice = Math.ceil(
          (now.getTime() - invoiceCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceFirstInvoice <= 3) {
          isTrial = true;
          planStatus = "trial";
        }
      } else {
        if (!isExpired && daysSinceCreation <= TRIAL_PERIOD_DAYS) {
          isTrial = true;
          planStatus = "trial";
        }
      }

      return {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        cpfCnpj: company.cpfCnpj,
        status: company.status ? "ativo" : "inativo",
        createdAt: company.createdAt,
        dueDate: company.dueDate,
        daysUntilExpiry,
        partner: {
          id: company.partner.id,
          nome: company.partner.nome,
          email: company.partner.email,
          telefone: company.partner.telefone
        },
        plan: {
          id: company.plan?.id,
          name: company.plan?.name,
          value: company.plan?.value,
          users: company.plan?.users,
          connections: company.plan?.connections,
          queues: company.plan?.queues
        },
        planStatus: {
          status: planStatus,
          isTrial,
          isSubscribed,
          isExpired,
          daysSinceCreation,
          daysUntilExpiry,
          totalInvoices: companyInvoices.length,
          paidInvoices: paidInvoices.length,
          openInvoices: openInvoices.length
        }
      };
    });

    // Calcular estatísticas gerais
    const stats = {
      total: count,
      trial: companiesWithDetails.filter(c => c.planStatus.isTrial).length,
      subscribed: companiesWithDetails.filter(c => c.planStatus.isSubscribed)
        .length,
      expired: companiesWithDetails.filter(
        c => c.planStatus.status === "expired"
      ).length,
      active: companiesWithDetails.filter(c => c.status === "ativo").length,
      inactive: companiesWithDetails.filter(c => c.status === "inativo").length,
      totalValue: companiesWithDetails.reduce(
        (sum, c) => sum + (c.plan?.value || 0),
        0
      )
    };

    return res.json({
      companies: companiesWithDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      },
      stats
    });
  } catch (error) {
    console.error("Erro ao buscar empresas indicadas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getMyFinancials = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const partnerId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search = "",
      month,
      year,
      status // "paid", "pending", "expired", "all"
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Condições de busca para empresas do parceiro
    const companyWhereCondition: any = {
      partnerId: partnerId
    };

    if (search) {
      companyWhereCondition.name = {
        [require("sequelize").Op.iLike]: `%${search}%`
      };
    }

    // Buscar empresas do parceiro
    const companies = await Company.findAll({
      where: companyWhereCondition,
      attributes: ["id", "name", "email", "status", "createdAt"],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "value"]
        }
      ]
    });

    if (companies.length === 0) {
      return res.json({
        summary: {
          totalReceived: 0,
          totalPending: 0,
          totalInvoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          expiredInvoices: 0,
          averageInvoiceValue: 0
        },
        invoices: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0
        },
        filters: {
          search,
          month: month ? Number(month) : null,
          year: year ? Number(year) : null,
          status: status || "all"
        }
      });
    }

    const companyIds = companies.map(company => company.id);

    // Condições de busca para faturas
    const invoiceWhereCondition: any = {
      companyId: { [require("sequelize").Op.in]: companyIds }
    };

    // Filtro por mês/ano
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

      invoiceWhereCondition.dueDate = {
        [require("sequelize").Op.between]: [startDate, endDate]
      };
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);

      invoiceWhereCondition.dueDate = {
        [require("sequelize").Op.between]: [startDate, endDate]
      };
    }

    // Filtro por status
    if (status && status !== "all") {
      if (status === "paid") {
        invoiceWhereCondition.status = "PAID";
      } else if (status === "pending") {
        invoiceWhereCondition.status = "open";
        invoiceWhereCondition.dueDate = {
          [require("sequelize").Op.gte]: new Date()
        };
      } else if (status === "expired") {
        invoiceWhereCondition.status = "open";
        invoiceWhereCondition.dueDate = {
          [require("sequelize").Op.lt]: new Date()
        };
      }
    }

    // Buscar todas as faturas das empresas do parceiro
    const { count, rows: allInvoices } = await Invoices.findAndCountAll({
      where: invoiceWhereCondition,
      attributes: [
        "id",
        "status",
        "value",
        "dueDate",
        "createdAt",
        "detail",
        "companyId"
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset
    });

    // Buscar todas as faturas para cálculo de totais (sem paginação)
    const totalInvoices = await Invoices.findAll({
      where: invoiceWhereCondition,
      attributes: ["status", "value", "dueDate"]
    });

    // Calcular totais
    const now = new Date();
    const totalReceived = totalInvoices
      .filter(invoice => invoice.status === "PAID")
      .reduce((sum, invoice) => sum + parseFloat(invoice.value.toString()), 0);

    const totalPending = totalInvoices
      .filter(invoice => invoice.status === "open")
      .reduce((sum, invoice) => sum + parseFloat(invoice.value.toString()), 0);

    // Criar um mapa de empresas para facilitar o lookup
    const companiesMap = companies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as Record<number, any>);

    // Preparar dados das faturas com status detalhado
    const invoicesData = allInvoices.map(invoice => {
      const company = companiesMap[invoice.companyId];
      const dueDate = new Date(invoice.dueDate);
      const isExpired = dueDate < now && invoice.status === "open";

      let invoiceStatus = "pending";
      if (invoice.status === "PAID") {
        invoiceStatus = "paid";
      } else if (isExpired) {
        invoiceStatus = "expired";
      }

      return {
        id: invoice.id,
        companyName: company?.name || "Empresa não encontrada",
        companyEmail: company?.email || "",
        planName: company?.plan?.name || "Sem plano",
        planValue: company?.plan?.value || 0,
        invoiceValue: parseFloat(invoice.value.toString()),
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt,
        status: invoiceStatus,
        detail: invoice.detail,
        daysUntilDue: Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        company: {
          id: company?.id,
          name: company?.name,
          email: company?.email,
          status: company?.status ? "ativo" : "inativo"
        },
        plan: {
          id: company?.plan?.id,
          name: company?.plan?.name,
          value: company?.plan?.value
        }
      };
    });

    // Estatísticas por status
    const paidCount = invoicesData.filter(inv => inv.status === "paid").length;
    const pendingCount = invoicesData.filter(
      inv => inv.status === "pending"
    ).length;
    const expiredCount = invoicesData.filter(
      inv => inv.status === "expired"
    ).length;

    const financialSummary = {
      totalReceived: Number(totalReceived.toFixed(2)),
      totalPending: Number(totalPending.toFixed(2)),
      totalInvoices: totalInvoices.length,
      paidInvoices: paidCount,
      pendingInvoices: pendingCount,
      expiredInvoices: expiredCount,
      averageInvoiceValue:
        totalInvoices.length > 0
          ? Number(
              (
                totalInvoices.reduce(
                  (sum, inv) => sum + parseFloat(inv.value.toString()),
                  0
                ) / totalInvoices.length
              ).toFixed(2)
            )
          : 0
    };

    return res.json({
      summary: financialSummary,
      invoices: invoicesData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      },
      filters: {
        search,
        month: month ? Number(month) : null,
        year: year ? Number(year) : null,
        status: status || "all"
      }
    });
  } catch (error) {
    console.error("Erro ao buscar financeiro do parceiro:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
export const getAllFinancials = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      month,
      year,
      status, // "paid", "pending", "expired", "all"
      partner // id do parceiro ou parte do nome/email
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Condições de busca para empresas
    const companyWhereCondition: any = {};
    if (search) {
      companyWhereCondition.name = {
        [require("sequelize").Op.iLike]: `%${search}%`
      };
    }
    if (partner) {
      if (!isNaN(Number(partner))) {
        companyWhereCondition.partnerId = Number(partner);
      } else {
        // Buscar parceiros pelo nome/email
        const partners = await Partner.findAll({
          where: {
            [require("sequelize").Op.or]: [
              { nome: { [require("sequelize").Op.iLike]: `%${partner}%` } },
              { email: { [require("sequelize").Op.iLike]: `%${partner}%` } }
            ]
          },
          attributes: ["id"]
        });
        const partnerIds = partners.map(p => p.id);
        if (partnerIds.length > 0) {
          companyWhereCondition.partnerId = {
            [require("sequelize").Op.in]: partnerIds
          };
        } else {
          // Nenhum parceiro encontrado, retorna vazio
          return res.json({
            summary: {
              totalReceived: 0,
              totalPending: 0,
              totalInvoices: 0,
              paidInvoices: 0,
              pendingInvoices: 0,
              expiredInvoices: 0,
              averageInvoiceValue: 0
            },
            invoices: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              pages: 0
            },
            filters: {
              search,
              month: month ? Number(month) : null,
              year: year ? Number(year) : null,
              status: status || "all",
              partner: partner || null
            }
          });
        }
      }
    }

    // Buscar empresas
    const companies = await Company.findAll({
      where: companyWhereCondition,
      attributes: ["id", "name", "email", "status", "createdAt", "partnerId"],
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "value"]
        },
        {
          model: Partner,
          as: "partner",
          attributes: ["id", "nome", "email"]
        }
      ]
    });

    if (companies.length === 0) {
      return res.json({
        summary: {
          totalReceived: 0,
          totalPending: 0,
          totalInvoices: 0,
          paidInvoices: 0,
          pendingInvoices: 0,
          expiredInvoices: 0,
          averageInvoiceValue: 0
        },
        invoices: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0
        },
        filters: {
          search,
          month: month ? Number(month) : null,
          year: year ? Number(year) : null,
          status: status || "all",
          partner: partner || null
        }
      });
    }

    const companyIds = companies.map(company => company.id);

    // Condições de busca para faturas
    const invoiceWhereCondition: any = {
      companyId: { [require("sequelize").Op.in]: companyIds }
    };
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      invoiceWhereCondition.dueDate = {
        [require("sequelize").Op.between]: [startDate, endDate]
      };
    } else if (year) {
      const startDate = new Date(Number(year), 0, 1);
      const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
      invoiceWhereCondition.dueDate = {
        [require("sequelize").Op.between]: [startDate, endDate]
      };
    }
    if (status && status !== "all") {
      if (status === "paid") {
        invoiceWhereCondition.status = "PAID";
      } else if (status === "pending") {
        invoiceWhereCondition.status = "open";
        invoiceWhereCondition.dueDate = {
          [require("sequelize").Op.gte]: new Date()
        };
      } else if (status === "expired") {
        invoiceWhereCondition.status = "open";
        invoiceWhereCondition.dueDate = {
          [require("sequelize").Op.lt]: new Date()
        };
      }
    }

    // Buscar todas as faturas das empresas
    const { count, rows: allInvoices } = await Invoices.findAndCountAll({
      where: invoiceWhereCondition,
      attributes: [
        "id",
        "status",
        "value",
        "dueDate",
        "createdAt",
        "detail",
        "companyId"
      ],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset
    });

    // Buscar todas as faturas para cálculo de totais (sem paginação)
    const totalInvoices = await Invoices.findAll({
      where: invoiceWhereCondition,
      attributes: ["status", "value", "dueDate"]
    });

    // Criar um mapa de empresas para facilitar o lookup
    const companiesMap = companies.reduce((acc, company) => {
      acc[company.id] = company;
      return acc;
    }, {} as Record<number, any>);

    // Calcular totais
    const now = new Date();
    const totalReceived = totalInvoices
      .filter(invoice => invoice.status === "PAID")
      .reduce((sum, invoice) => sum + parseFloat(invoice.value.toString()), 0);
    const totalPending = totalInvoices
      .filter(invoice => invoice.status === "open")
      .reduce((sum, invoice) => sum + parseFloat(invoice.value.toString()), 0);

    // Preparar dados das faturas com status detalhado
    const invoicesData = allInvoices.map(invoice => {
      const company = companiesMap[invoice.companyId];
      const dueDate = new Date(invoice.dueDate);
      const isExpired = dueDate < now && invoice.status === "open";
      let invoiceStatus = "pending";
      if (invoice.status === "PAID") {
        invoiceStatus = "paid";
      } else if (isExpired) {
        invoiceStatus = "expired";
      }
      return {
        id: invoice.id,
        companyName: company?.name || "Empresa não encontrada",
        companyEmail: company?.email || "",
        partner: company?.partner
          ? {
              id: company.partner.id,
              nome: company.partner.nome,
              email: company.partner.email
            }
          : null,
        planName: company?.plan?.name || "Sem plano",
        planValue: company?.plan?.value || 0,
        invoiceValue: parseFloat(invoice.value.toString()),
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt,
        status: invoiceStatus,
        detail: invoice.detail,
        daysUntilDue: Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        company: {
          id: company?.id,
          name: company?.name,
          email: company?.email,
          status: company?.status ? "ativo" : "inativo"
        },
        plan: {
          id: company?.plan?.id,
          name: company?.plan?.name,
          value: company?.plan?.value
        }
      };
    });

    // Estatísticas por status
    const paidCount = invoicesData.filter(inv => inv.status === "paid").length;
    const pendingCount = invoicesData.filter(
      inv => inv.status === "pending"
    ).length;
    const expiredCount = invoicesData.filter(
      inv => inv.status === "expired"
    ).length;

    const financialSummary = {
      totalReceived: Number(totalReceived.toFixed(2)),
      totalPending: Number(totalPending.toFixed(2)),
      totalInvoices: totalInvoices.length,
      paidInvoices: paidCount,
      pendingInvoices: pendingCount,
      expiredInvoices: expiredCount,
      averageInvoiceValue:
        totalInvoices.length > 0
          ? Number(
              (
                totalInvoices.reduce(
                  (sum, inv) => sum + parseFloat(inv.value.toString()),
                  0
                ) / totalInvoices.length
              ).toFixed(2)
            )
          : 0
    };

    return res.json({
      summary: financialSummary,
      invoices: invoicesData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      },
      filters: {
        search,
        month: month ? Number(month) : null,
        year: year ? Number(year) : null,
        status: status || "all",
        partner: partner || null
      }
    });
  } catch (error) {
    console.error("Erro ao buscar financeiro geral:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
