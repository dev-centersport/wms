import React from 'react';
import {
<<<<<<< Updated upstream
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
=======
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
>>>>>>> Stashed changes
import { useLocalizacoes } from '../components/ApiComponents';


const Armazem: React.FC = () => {
  // Hook personalizado que gerencia a lógica de localizações
  const {
<<<<<<< Updated upstream
    locaisFiltrados,
=======
    listaLocalizacoes,
    locaisFiltrados,
    busca,
    setBusca,
    mostrarFormulario,
    setMostrarFormulario,
    mostrarFiltro,
    setMostrarFiltro,
    setListaLocalizacoes,
>>>>>>> Stashed changes
  } = useLocalizacoes();

  return (
    <TableBody>
      {locaisFiltrados.length ? (
        locaisFiltrados.map((item, index) => (
<<<<<<< Updated upstream
          <TableRow key={`${item.nome}-${index}`}>
=======
          <TableRow key={`${item.localizacao}-${index}`}>
>>>>>>> Stashed changes
            <TableCell>{item.armazem}</TableCell>
            <TableCell>{item.capacidade}</TableCell>
            <TableCell>{item.endereco}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={6}>Nenhum resultado encontrado.</TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

  export default Armazem;
