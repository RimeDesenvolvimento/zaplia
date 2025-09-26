import fs from "fs";
import path from "path";
import FilesOptions from "../../models/FilesOptions";
import AppError from "../../errors/AppError";
import Files from "../../models/Files";

const DeleteService = async (
  id: string | number,
  companyId: number
): Promise<void> => {
  const publicFolder = path.resolve(__dirname, "../../../", "public/fileList");
  const file = await Files.findOne({
    where: { id, companyId }
  });

  if (!file) {
    throw new AppError("ERR_NO_RATING_FOUND", 404);
  }

  const options = await FilesOptions.findAll({
    where: { fileId: id }
  });

  for (const opt of options) {
    if (opt.path) {
      const filePath = path.resolve(publicFolder, String(id), opt.path);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn(`Não foi possível remover ${filePath}:`, err.message);
      }
    }
  }

  await FilesOptions.destroy({ where: { fileId: id } });

  await file.destroy();
};

export default DeleteService;
