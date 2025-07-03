import React from 'react';
import {
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { useLocalizacoes } from '../components/ApiComponents';


const Armazem: React.FC = () => {
  // Hook personalizado que gerencia a lógica de localizações
  const {
    locaisFiltrados,
  } = useLocalizacoes();

  return (
    <TableBody>
      {locaisFiltrados.length ? (
        locaisFiltrados.map((item, index) => (
          <TableRow key={`${item.nome}-${index}`}>
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
