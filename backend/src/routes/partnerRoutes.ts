import { Router } from "express";
import * as PartnerController from "../controllers/PartnerController";
import isAuth from "../middleware/isAuth";
import isPartnerAuth from "../middleware/isPartnerAuth";
import isPartnerAdmin from "../middleware/isPartnerAdmin";

const partnerRoutes = Router();

// Rota de login para parceiros (sem autenticação)
partnerRoutes.post("/partners/login", PartnerController.login);

// Rota para alterar senha do parceiro
partnerRoutes.put("/partners/:id/change-password", isPartnerAuth, PartnerController.changePassword);

// Rota para o parceiro visualizar suas empresas indicadas
partnerRoutes.get("/partners/my-companies", isPartnerAuth, PartnerController.getMyCompanies);

// Rota para estatísticas das empresas do parceiro
partnerRoutes.get("/partners/my-companies/stats", isPartnerAuth, PartnerController.getMyCompaniesStats);
partnerRoutes.get("/partners/my-financials", isPartnerAuth, PartnerController.getMyFinancials);
// Rota ADMIN para ver todas as empresas indicadas (com paginação)
partnerRoutes.get("/partners/admin/referred-companies", isPartnerAdmin, PartnerController.getAllReferredCompanies);
partnerRoutes.get("/partners/admin/financials", isPartnerAdmin, PartnerController.getAllFinancials)
partnerRoutes.get("/partners", isAuth, PartnerController.index);
partnerRoutes.post("/partners", isAuth, PartnerController.store);
partnerRoutes.get("/partners/:id", isAuth, PartnerController.show);
partnerRoutes.put("/partners/:id", isAuth, PartnerController.update);
partnerRoutes.delete("/partners/:id", isAuth, PartnerController.remove);

// Rotas para associação de empresas
partnerRoutes.post("/partners/associate-company", isAuth, PartnerController.associateCompany);
partnerRoutes.put("/partners/disassociate-company/:companyId", isAuth, PartnerController.disassociateCompany);

export default partnerRoutes;
