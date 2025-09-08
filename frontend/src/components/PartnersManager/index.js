import React, { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  makeStyles,
} from '@material-ui/core';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@material-ui/icons';
import { toast } from 'react-toastify';
import api from '../../services/api';
import toastError from '../../errors/toastError';
import ConfirmationModal from '../ConfirmationModal';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(2),
  },
  formCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  formGrid: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
  },
  table: {
    minWidth: 650,
  },
  statusChip: {
    fontWeight: 'bold',
  },
  activeStatus: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  inactiveStatus: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
}));

const PartnersManager = () => {
  const classes = useStyles();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpfCpnj: '',
    urlParceiro: '',
    telefone: '',
    walletId: '',
    porcentagemComissao: 40,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/partners');
      setPartners(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.email.trim()) {
      toast.error(
        'Por favor, preencha todos os campos obrigatórios (Nome e E-mail).'
      );
      return;
    }
    try {
      setLoading(true);

      if (editingPartner) {
        await api.put(`/partners/${editingPartner.id}`, formData);
        toast.success('Parceiro atualizado com sucesso!');
      } else {
        await api.post('/partners', formData);
        toast.success('Parceiro cadastrado com sucesso!');
      }

      resetForm();
      fetchPartners();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      cpfCpnj: '',
      urlParceiro: '',
      telefone: '',
      walletId: '',
      porcentagemComissao: 40,
    });
    setEditingPartner(null);
  };

  const handleEdit = partner => {
    setFormData({
      nome: partner.nome || '',
      email: partner.email || '',
      cpfCpnj: partner.cpfCpnj || '',
      urlParceiro: partner.urlParceiro || '',
      telefone: partner.telefone || '',
      walletId: partner.walletId || '',
      porcentagemComissao: partner.porcentagemComissao || 40,
    });
    setEditingPartner(partner);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/partners/${partnerToDelete.id}`);
      toast.success('Parceiro excluído com sucesso!');
      fetchPartners();
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setPartnerToDelete(null);
    }
  };

  const openDeleteModal = partner => {
    setPartnerToDelete(partner);
    setConfirmModalOpen(true);
  };

  return (
    <div className={classes.root}>
      {/* Formulário */}
      <Card className={classes.formCard}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <AddIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">
              {editingPartner ? 'Editar Parceiro' : 'Cadastrar Parceiro'}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} className={classes.formGrid}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CNPJ ou CPF"
                  name="cpfCpnj"
                  value={formData.cpfCpnj}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID da Carteira"
                  name="walletId"
                  value={formData.walletId}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  placeholder="ID da Carteira"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Porcentagem de Comissão"
                  name="porcentagemComissao"
                  value={formData.porcentagemComissao}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  type="number"
                  placeholder="Porcentagem de Comissão"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL do Parceiro"
                  name="urlParceiro"
                  value={formData.urlParceiro}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                  placeholder="https://exemplo.com"
                />
              </Grid>
            </Grid>

            <div className={classes.buttonContainer}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={<AddIcon />}
              >
                {editingPartner ? 'Atualizar' : 'Cadastrar'} Parceiro
              </Button>

              {editingPartner && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Parceiros */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Parceiros
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>CNPJ/CPF</TableCell>
                  <TableCell>URL Parceiro</TableCell>
                  <TableCell>Porcentagem de Comissão</TableCell>
                  <TableCell>ID da Carteira</TableCell>
                  <TableCell>Empresas</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Criado Em</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Dados dinâmicos dos parceiros */}
                {partners.length > 0 ? (
                  partners.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.nome}</TableCell>
                      <TableCell>{partner.email}</TableCell>
                      <TableCell>{partner.telefone || '-'}</TableCell>
                      <TableCell>{partner.cpfCpnj || '-'}</TableCell>
                      <TableCell>{`https://zaplia.com.br/trial-teste-gratis?token=${
                        partner.urlParceiro || '-'
                      }`}</TableCell>
                      <TableCell>
                        {partner.porcentagemComissao || '-'}
                      </TableCell>
                      <TableCell>{partner.walletId || '-'}</TableCell>
                      <TableCell>
                        {partner.companies && partner.companies.length > 0 ? (
                          <div>{partner.companies.length}</div>
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Nenhuma empresa
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={partner.status}
                          size="small"
                          className={`${classes.statusChip} ${
                            partner.status === 'Sim'
                              ? classes.activeStatus
                              : classes.inactiveStatus
                          }`}
                        />
                      </TableCell>
                      <TableCell>
                        {partner.criadoEm
                          ? new Date(partner.criadoEm).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(partner)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => openDeleteModal(partner)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="textSecondary">
                        {loading
                          ? 'Carregando...'
                          : 'Nenhum parceiro cadastrado'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal de Confirmação para Exclusão */}
      <ConfirmationModal
        title="Excluir Parceiro"
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
      >
        Tem certeza que deseja excluir o parceiro "{partnerToDelete?.nome}"?
      </ConfirmationModal>
    </div>
  );
};

export default PartnersManager;
