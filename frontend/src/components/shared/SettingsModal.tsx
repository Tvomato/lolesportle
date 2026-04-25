"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import {
  loadSettings,
  saveSettings,
  clearGameState,
  DEFAULT_SETTINGS,
  PlayerQuerySettings,
} from "@/utils/storage";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import styles from "@/styles/shared/SettingsModal.module.css";

interface SettingsModalProps {
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2013;

type NumericField = "start_year" | "end_year" | "tourny_count";
type FieldErrors = Partial<Record<keyof PlayerQuerySettings, string>>;

function validate(draft: PlayerQuerySettings): FieldErrors {
  const errors: FieldErrors = {};

  if (!Number.isInteger(draft.start_year) || draft.start_year < MIN_YEAR || draft.start_year > CURRENT_YEAR) {
    errors.start_year = `Must be between ${MIN_YEAR} and ${CURRENT_YEAR}`;
  }
  if (!Number.isInteger(draft.end_year) || draft.end_year < MIN_YEAR || draft.end_year > CURRENT_YEAR) {
    errors.end_year = `Must be between ${MIN_YEAR} and ${CURRENT_YEAR}`;
  } else if (draft.end_year < draft.start_year) {
    errors.end_year = "Must be ≥ start year";
  }
  if (!Number.isInteger(draft.tourny_count) || draft.tourny_count < 1) {
    errors.tourny_count = "Must be at least 1";
  }

  return errors;
}

interface NumberInputProps {
  id: string;
  field: NumericField;
  value: number;
  min: number;
  max?: number;
  error?: string;
  label: string;
  narrow?: boolean;
  onChange: (field: NumericField, raw: string) => void;
  onStep: (field: NumericField, delta: number) => void;
}

function NumberInput({ id, field, value, min, max, error, label, narrow, onChange, onStep }: NumberInputProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={`${styles.inputWrapper} ${narrow ? styles.inputWrapperNarrow : ""}`}>
        <input
          id={id}
          type="number"
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(field, e.target.value)}
        />
        <div className={styles.spinnerButtons}>
          <button
            type="button"
            className={styles.spinnerBtn}
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onStep(field, 1); }}
          >▴</button>
          <button
            type="button"
            className={styles.spinnerBtn}
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onStep(field, -1); }}
          >▾</button>
        </div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { closing, handleClose, handleAnimationEnd } = useModalAnimation(onClose);
  const [draft, setDraft] = useState<PlayerQuerySettings>(() => loadSettings());
  const [errors, setErrors] = useState<FieldErrors>({});

  const setNumber = (field: NumericField, raw: string) => {
    const val = raw === "" ? NaN : parseInt(raw, 10);
    const next = { ...draft, [field]: isNaN(val) ? raw : val };
    setDraft(next as PlayerQuerySettings);
    setErrors(validate(next as PlayerQuerySettings));
  };

  const stepNumber = (field: NumericField, delta: number) => {
    const current = typeof draft[field] === "number" ? (draft[field] as number) : 0;
    setNumber(field, String(current + delta));
  };

  const setBool = (field: keyof PlayerQuerySettings, val: boolean) => {
    const next = { ...draft, [field]: val };
    setDraft(next);
    setErrors(validate(next));
  };

  const handleSave = () => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    saveSettings(draft);
    clearGameState("classic");
    clearGameState("face");
    handleClose();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_SETTINGS });
    setErrors({});
  };

  const hasErrors = Object.keys(errors).length > 0;

  return createPortal(
    <div
      className={`${styles.backdrop} ${closing ? styles.backdropOut : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.flyOut : styles.flyIn}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>Settings</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            <MdClose size={18} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Year Range</span>
            <div className={styles.row}>
              <NumberInput
                id="start_year"
                field="start_year"
                label="Start Year"
                value={draft.start_year}
                min={MIN_YEAR}
                max={CURRENT_YEAR}
                error={errors.start_year}
                onChange={setNumber}
                onStep={stepNumber}
              />
              <NumberInput
                id="end_year"
                field="end_year"
                label="End Year"
                value={draft.end_year}
                min={MIN_YEAR}
                max={CURRENT_YEAR}
                error={errors.end_year}
                onChange={setNumber}
                onStep={stepNumber}
              />
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Min Tournaments</span>
            <NumberInput
              id="tourny_count"
              field="tourny_count"
              label="Minimum number of tournaments played in range"
              value={draft.tourny_count}
              min={1}
              error={errors.tourny_count}
              narrow
              onChange={setNumber}
              onStep={stepNumber}
            />
          </div>

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Include Players</span>
            {/* TODO: Re-enable after exploring improvements to teamless players design and handling */}
            {/* <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={draft.include_retired}
                onChange={(e) => setBool("include_retired", e.target.checked)}
              />
              Include retired players (no current team)
            </label> */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={draft.include_current_year}
                onChange={(e) => setBool("include_current_year", e.target.checked)}
              />
              Include all players active in tier 1 this year
            </label>
            <p className={styles.hint}>
              (Players who competed in any tier 1 tournament this year, regardless of the year range and tournament count above)
            </p>
          </div>

          <div className={styles.divider} />

          <div className={styles.footer}>
            <button className={styles.btnSecondary} onClick={handleReset}>
              Reset to Defaults
            </button>
            <button
              className={`${styles.btnPrimary} ${hasErrors ? styles.btnDisabled : ""}`}
              onClick={handleSave}
              disabled={hasErrors}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
