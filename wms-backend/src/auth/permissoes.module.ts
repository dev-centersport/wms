import { Module, forwardRef } from '@nestjs/common';
import { PermissoesGuard } from './permissoes.guard';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [forwardRef(() => UsuarioModule)],
  providers: [PermissoesGuard],
  exports: [PermissoesGuard],
})
export class PermissoesModule {}
