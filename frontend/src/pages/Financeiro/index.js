import React, { useState, useEffect, useReducer } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';

import Title from '../../components/Title';
import SubscriptionModal from '../../components/SubscriptionModal';
import api from '../../services/api';
import { i18n } from '../../translate/i18n';
import TableRowSkeleton from '../../components/TableRowSkeleton';

import toastError from '../../errors/toastError';

import moment from 'moment';

const reducer = (state, action) => {
  if (action.type === 'LOAD_INVOICES') {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach(user => {
      const userIndex = state.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === 'UPDATE_USERS') {
    const user = action.payload;
    const userIndex = state.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === 'DELETE_USER') {
    const userId = action.payload;

    const userIndex = state.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === 'RESET') {
    return [];
  }
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: 'scroll',
    ...theme.scrollbarStyles,
  },
  planSelectionContainer: {
    padding: theme.spacing(3),
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  planSelect: {
    minWidth: 300,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  payButton: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1, 4),
  },
}));

const Invoices = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plansLoading, setPlansLoading] = useState(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  const isOverdue = localStorage.getItem('isOverdue') === 'true';

  const handleOpenContactModal = invoices => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };
  useEffect(() => {
    dispatch({ type: 'RESET' });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(async () => {
    try {
      const isOverdue = localStorage.getItem('isOverdue') === 'true';
      if (!isOverdue) return;

      const response = await api.get('/companies/checkIsOverdue');

      const isOverdueResponse = response.data.isOverdue;

      if (isOverdueResponse === false) {
        localStorage.setItem('isOverdue', isOverdueResponse);
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao verificar vencimento do plano:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get('/invoices/all', {
            params: { searchParam, pageNumber },
          });

          dispatch({
            type: 'LOAD_INVOICES',
            payload: data.filter(invoice => invoice.value > 0),
          });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };
  const rowStyle = record => {
    const hoje = moment(moment()).format('DD/MM/yyyy');
    const vencimento = moment(record.dueDate).format('DD/MM/yyyy');
    var diff = moment(vencimento, 'DD/MM/yyyy').diff(
      moment(hoje, 'DD/MM/yyyy')
    );
    var dias = moment.duration(diff).asDays();
    if (dias < 0 && record.status !== 'paid') {
      return { backgroundColor: '#ffbcbc9c' };
    }
  };

  const rowStatus = record => {
    const hoje = moment(moment()).format('DD/MM/yyyy');
    const vencimento = moment(record.dueDate).format('DD/MM/yyyy');
    var diff = moment(vencimento, 'DD/MM/yyyy').diff(
      moment(hoje, 'DD/MM/yyyy')
    );
    var dias = moment.duration(diff).asDays();
    const status = record.status;
    if (status.toLowerCase() === 'paid') {
      return i18n.t('invoices.paid');
    }
    if (dias < 0) {
      return i18n.t('invoices.expired');
    } else {
      return i18n.t('invoices.open');
    }
  };

  const fetchAvailablePlans = async () => {
    setPlansLoading(true);
    try {
      const { data } = await api.get('/plans/list');

      setAvailablePlans(data.filter(plan => plan.value > 0));
    } catch (err) {
      toastError(err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpdatePlan = async planId => {
    try {
      setIsUpdatingPlan(true);
      const companyId = localStorage.getItem('companyId');

      await api.put(`/companies/${companyId}/plan`, {
        newPlanId: planId,
      });

      let newInvoices = [];
      let tentativas = 0;
      do {
        const { data } = await api.get('/invoices/all', {
          params: { searchParam, pageNumber: 1 },
        });
        newInvoices = data.filter(invoice => invoice.value > 0);
        tentativas++;
        if (newInvoices.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } while (newInvoices.length === 0 && tentativas < 5);

      dispatch({ type: 'RESET' });
      dispatch({ type: 'LOAD_INVOICES', payload: newInvoices });

      if (newInvoices.length > 0) {
        handleOpenContactModal(newInvoices[0]);
      }
    } catch (err) {
      console.log('erro ao atualizar plano: ', err);
      window.location.reload();
      toastError(err);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  useEffect(() => {
    if (isOverdue || invoices.length === 0) {
      fetchAvailablePlans();
    }
  }, [isOverdue, invoices.length]);

  if (loading)
    return (
      <MainContainer>
        <MainHeader>
          <Title>{i18n.t('invoices.title')}</Title>
        </MainHeader>
        <Paper className={classes.mainPaper} variant="outlined">
          <TableRowSkeleton columns={6} />
        </Paper>
      </MainContainer>
    );

  if (invoices.length === 0) {
    return (
      <MainContainer>
        <MainHeader>
          <Title>{i18n.t('invoices.title')}</Title>
        </MainHeader>
        <Paper className={classes.mainPaper} variant="outlined">
          <Box className={classes.planSelectionContainer}>
            <Typography variant="h5" color="error" gutterBottom>
              {isOverdue
                ? 'O seu plano gratuito expirou!'
                : 'Você está no plano gratuito.'}
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              {isOverdue
                ? 'Para continuar usando nossos serviços, selecione um plano abaixo:'
                : 'Selecione um dos nossos planos para obter mais vantagens!'}
            </Typography>

            <FormControl className={classes.planSelect}>
              <InputLabel>Selecione um Plano</InputLabel>
              <Select
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                disabled={plansLoading}
              >
                {availablePlans.map(plan => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name} -{' '}
                    {plan.value.toLocaleString('pt-br', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <br />

            <Button
              variant="contained"
              color="primary"
              className={classes.payButton}
              disabled={!selectedPlan || plansLoading || isUpdatingPlan}
              onClick={() => handleUpdatePlan(selectedPlan)}
            >
              {plansLoading || isUpdatingPlan
                ? 'Carregando...'
                : 'Assinar Plano'}
            </Button>
          </Box>
        </Paper>
      </MainContainer>
    );
  }
  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      ></SubscriptionModal>
      <MainHeader>
        <Title>{i18n.t('invoices.title')}</Title>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Id</TableCell>
              <TableCell align="center">{i18n.t('invoices.details')}</TableCell>
              <TableCell align="center">{i18n.t('invoices.value')}</TableCell>
              <TableCell align="center">{i18n.t('invoices.dueDate')}</TableCell>
              <TableCell align="center">{i18n.t('invoices.status')}</TableCell>
              <TableCell align="center">{i18n.t('invoices.action')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {invoices.map(invoices => (
                <TableRow style={rowStyle(invoices)} key={invoices.id}>
                  <TableCell align="center">{invoices.id}</TableCell>
                  <TableCell align="center">{invoices.detail}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">
                    {invoices.value.toLocaleString('pt-br', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {moment(invoices.dueDate).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">
                    {rowStatus(invoices)}
                  </TableCell>
                  <TableCell align="center">
                    {rowStatus(invoices) !== i18n.t('invoices.paid') ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        {i18n.t('invoices.PAY')}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        /* color="secondary"
                        disabled */
                      >
                        {i18n.t('invoices.PAID')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
