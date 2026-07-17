import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Modal, Button } from '../voyable'
import { useTranslation } from '../../i18n'

interface AiUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AiUpgradeModal({ isOpen, onClose }: AiUpgradeModalProps): React.ReactElement {
  const { t } = useTranslation()
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>{t('aiPlanning.upgrade.notNow')}</Button>
          <Link to="/pricing" onClick={onClose} className="inline-flex items-center px-5 h-11 rounded-full bg-accent text-accent-text text-body font-semibold no-underline">
            {t('aiPlanning.upgrade.seePlans')}
          </Link>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className="w-[52px] h-[52px] rounded-2xl bg-[var(--olive-50)] text-[var(--olive-500)] flex items-center justify-center">
          <Sparkles size={22} />
        </div>
        <h3 className="font-display font-bold text-subtitle text-content m-0">{t('aiPlanning.upgrade.title')}</h3>
        <p className="text-body text-content-secondary m-0">{t('aiPlanning.upgrade.body')}</p>
      </div>
    </Modal>
  )
}
