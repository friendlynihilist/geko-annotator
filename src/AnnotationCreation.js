import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import PersonIcon from "@material-ui/icons/Person";
// import PsychologyIcon from '@material-ui/icons/Psychology';
import BookIcon from "@material-ui/icons/Book";
import RectangleIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CircleIcon from "@material-ui/icons/RadioButtonUnchecked";
import PolygonIcon from "@material-ui/icons/Timeline";
import GestureIcon from "@material-ui/icons/Gesture";
import ClosedPolygonIcon from "@material-ui/icons/ChangeHistory";
import OpenPolygonIcon from "@material-ui/icons/ShowChart";
import FormatColorFillIcon from "@material-ui/icons/FormatColorFill";
import StrokeColorIcon from "@material-ui/icons/BorderColor";
import LineWeightIcon from "@material-ui/icons/LineWeight";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FormatShapesIcon from "@material-ui/icons/FormatShapes";
import InputLabel from "@material-ui/core/InputLabel";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select, { SelectChangeEvent } from "@material-ui/core/Select";
import Popover from "@material-ui/core/Popover";
import Divider from "@material-ui/core/Divider";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";
import { SketchPicker } from "react-color";
import { v4 as uuid } from "uuid";
import { withStyles } from "@material-ui/core/styles";
import CompanionWindow from "mirador/dist/es/src/containers/CompanionWindow";
import AnnotationDrawing from "./AnnotationDrawing";
import TextEditor from "./TextEditor";
import WebAnnotation from "./WebAnnotation";
import CursorIcon from "./icons/Cursor";
import Accordion from '@material-ui/core/Accordion';
import AccordionActions from '@material-ui/core/AccordionActions';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

/** */
class AnnotationCreation extends Component {
  /** */
  constructor(props) {
    console.log("PROPS --->", props);
    super(props);
    const annoState = {};
    if (props.annotation) {
      if (Array.isArray(props.annotation.body)) {
        annoState.tags = [];
        props.annotation.body.forEach((body) => {
          if (body.purpose === "tagging") {
            annoState.tags.push(body.value);
          } else {
            annoState.annoBody = body.value;
          }
        });
      } else {
        annoState.annoBody = props.annotation.body.value;
      }
      if (props.annotation.target.selector) {
        if (Array.isArray(props.annotation.target.selector)) {
          props.annotation.target.selector.forEach((selector) => {
            if (selector.type === "SvgSelector") {
              annoState.svg = selector.value;
            } else if (selector.type === "FragmentSelector") {
              annoState.xywh = selector.value.replace("xywh=", "");
            }
          });
        } else {
          annoState.svg = props.annotation.target.selector.value;
        }
      }
    }

    const toolState = {
      activeTool: "cursor",
      closedMode: "closed",
      currentColorType: false,
      fillColor: '#43ff6466',
      strokeColor: "#00BFFF",
      strokeWidth: 3,
      ...(props.config.annotation.defaults || {}),
    };

    this.state = {
      ...toolState,
      conceptualLevel: "Iconographical Level",
      anchorOptions: [
        "Mademoiselle Riviére",
        "Anchor 2"
      ],
      anchorValue: "",
      entityOptions: ["https://www.wikidata.org/wiki/Q24011"],
      entityValue: "",
      authorOptions: ["Author 1"],
      authorValue: "",
      criterionOptions: ["iconographic interpretation", "criterion 2"],
      criterionValue: "",
      annoBody: "",
      colorPopoverOpen: false,
      lineWeightPopoverOpen: false,
      popoverAnchorEl: null,
      popoverLineWeightAnchorEl: null,
      svg: null,
      textEditorStateBustingKey: 0,
      xywh: null,
      ...annoState,
    };

    this.submitForm = this.submitForm.bind(this);
    this.updateBody = this.updateBody.bind(this);
    this.updateGeometry = this.updateGeometry.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.changeClosedMode = this.changeClosedMode.bind(this);
    this.openChooseColor = this.openChooseColor.bind(this);
    this.openChooseLineWeight = this.openChooseLineWeight.bind(this);
    this.handleLineWeightSelect = this.handleLineWeightSelect.bind(this);
    this.handleCloseLineWeight = this.handleCloseLineWeight.bind(this);
    this.closeChooseColor = this.closeChooseColor.bind(this);
    this.updateStrokeColor = this.updateStrokeColor.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAnchorChange = this.handleAnchorChange.bind(this);
    this.handleEntityChange = this.handleEntityChange.bind(this);
    this.handleAuthorChange = this.handleAuthorChange.bind(this);
    this.handleCriterionChange = this.handleCriterionChange.bind(this);
  }

  /** */
  handleCloseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
    });
  }

  /** */
  handleLineWeightSelect(e) {
    this.setState({
      lineWeightPopoverOpen: false,
      popoverLineWeightAnchorEl: null,
      strokeWidth: e.currentTarget.value,
    });
  }

  /** */
  openChooseColor(e) {
    this.setState({
      colorPopoverOpen: true,
      currentColorType: e.currentTarget.value,
      popoverAnchorEl: e.currentTarget,
    });
  }

  /** */
  openChooseLineWeight(e) {
    this.setState({
      lineWeightPopoverOpen: true,
      popoverLineWeightAnchorEl: e.currentTarget,
    });
  }

  /** */
  closeChooseColor(e) {
    this.setState({
      colorPopoverOpen: false,
      currentColorType: null,
      popoverAnchorEl: null,
    });
  }

  /** */
  updateStrokeColor(color) {
    const { currentColorType } = this.state;
    this.setState({
      [currentColorType]: color.hex,
    });
  }

  /** */
  submitForm(e) {
    e.preventDefault();
    const { annotation, canvases, receiveAnnotation, config } = this.props;
    const {
      annoBody,
      tags,
      xywh,
      svg,
      conceptualLevel,
      anchorValue,
      entityValue,
      authorValue,
      criterionValue,
      textEditorStateBustingKey,
    } = this.state;
    canvases.forEach((canvas) => {
      const storageAdapter = config.annotation.adapter(canvas.id);
      const anno = new WebAnnotation({
        body: annoBody,
        canvasId: canvas.id,
        id: (annotation && annotation.id) || `urn:uuid:${uuid()}`,
        manifestId: canvas.options.resource.id,
        svg,
        tags,
        xywh,
        wasGeneratedBy: {
          id: `https://purl.archive.org/domain/mlao/interpretation/${uuid()}`,
          type: "InterpretationAct",
          hasInterpretationCriterion: {
            id: `https://purl.archive.org/domain/mlao/interpretation/criterion/${criterionValue
            .toLowerCase()
            .replaceAll(" ", "-")}`,
            type: "InterpretationCriterion",
          },
        },
        creator: authorValue ? {
          id: `https://purl.archive.org/domain/mlao/creator/${authorValue
          .toLowerCase()
          .replaceAll(" ", "-").replaceAll(".", "")}`,
          type: "foaf:Person",
          name: `${authorValue}`,
        }
        : "",
        hasAnchor: conceptualLevel
          ? {
              label: `${anchorValue}`,
              id: `https://purl.archive.org/domain/mlao/anchor/${anchorValue
                .toLowerCase()
                .replaceAll(" ", "-")}`, // https://digi.vatlib.it/iiif/MSS_Vat.gr.984/canvas/p0001
              type: "Anchor",
              hasConceptualLevel: {
                id: `https://purl.archive.org/domain/mlao/${conceptualLevel}/${uuid()}`,
                type: `${conceptualLevel}`,
              },
              isAnchoredTo: `https://purl.archive.org/domain/mlao/${entityValue
              .toLowerCase()
              .replaceAll(" ", "-").replaceAll(".", "")}`,
            }
          : "",
      }).toJson();
      if (annotation) {
        storageAdapter.update(anno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      } else {
        storageAdapter.create(anno).then((annoPage) => {
          receiveAnnotation(
            canvas.id,
            storageAdapter.annotationPageId,
            annoPage
          );
        });
      }
    });

    this.setState({
      annoBody: "",
      svg: null,
      textEditorStateBustingKey: textEditorStateBustingKey + 1,
      xywh: null,
    });
  }

  /** */
  changeTool(e, tool) {
    this.setState({
      activeTool: tool,
    });
  }

  /** */
  changeClosedMode(e) {
    this.setState({
      closedMode: e.currentTarget.value,
    });
  }

  /** */
  updateBody(annoBody) {
    this.setState({ annoBody });
  }

  /** */
  updateGeometry({ svg, xywh }) {
    this.setState({
      svg,
      xywh,
    });
  }

  handleChange(event) {
    console.log("EVENTO ----->", event);
    this.setState({ conceptualLevel: event.target.value });
    // console.log(this.conceptualLevel);
  }

  /** */
  handleAnchorChange(event, newValue) {
    const { anchorOptions } = this.state;
    if (newValue && !anchorOptions.includes(newValue)) {
      this.setState({
        anchorOptions: [...anchorOptions, newValue],
        anchorValue: newValue,
      });
    } else {
      this.setState({ anchorValue: newValue });
    }
  }

  handleEntityChange(event, newValue) {
    const { entityOptions } = this.state;
    if (newValue && !entityOptions.includes(newValue)) {
      this.setState({
        entityOptions: [...entityOptions, newValue],
        entityValue: newValue,
      });
    } else {
      this.setState({ entityValue: newValue });
    }
  }

  handleAuthorChange(event, newValue) {
    const { authorOptions } = this.state;
    if (newValue && !authorOptions.includes(newValue)) {
      this.setState({
        authorOptions: [...authorOptions, newValue],
        authorValue: newValue,
      });
    } else {
      this.setState({ authorValue: newValue });
    }
  }

  handleCriterionChange(event, newValue) {
    const { criterionOptions } = this.state;
    if (newValue && !criterionOptions.includes(newValue)) {
      this.setState({
        criterionOptions: [...criterionOptions, newValue],
        criterionValue: newValue,
      });
    } else {
      this.setState({ criterionValue: newValue });
    }
  }

  /** */
  render() {
    const { annotation, classes, closeCompanionWindow, id, windowId } =
      this.props;

    const {
      anchorOptions,
      anchorValue,
      entityOptions,
      entityValue,
      authorOptions,
      authorValue,
      criterionOptions,
      criterionValue,
      activeTool,
      colorPopoverOpen,
      currentColorType,
      fillColor,
      popoverAnchorEl,
      strokeColor,
      popoverLineWeightAnchorEl,
      lineWeightPopoverOpen,
      strokeWidth,
      closedMode,
      annoBody,
      svg,
      textEditorStateBustingKey,
    } = this.state;
    return (
      <CompanionWindow
        title={annotation ? "Edit annotation" : "New annotation"}
        windowId={windowId}
        id={id}
      >
        <AnnotationDrawing
          activeTool={activeTool}
          fillColor={fillColor}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          closed={closedMode === "closed"}
          svg={svg}
          updateGeometry={this.updateGeometry}
          windowId={windowId}
        />
        <form onSubmit={this.submitForm} className={classes.section}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Target</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} className={classes.paper}>
                <ToggleButtonGroup
                  className={classes.grouped}
                  value={activeTool}
                  exclusive
                  onChange={this.changeTool}
                  aria-label="tool selection"
                  size="small"
                  classes={{ grouped: classes.toggleButtonSmall }}
                >
                  <ToggleButton value="cursor" aria-label="select cursor">
                    <CursorIcon />
                  </ToggleButton>
                  <ToggleButton value="edit" aria-label="select cursor">
                    <FormatShapesIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <Divider
                  flexItem
                  orientation="vertical"
                  className={classes.divider}
                />
                <ToggleButtonGroup
                  className={classes.grouped}
                  value={activeTool}
                  exclusive
                  onChange={this.changeTool}
                  aria-label="tool selection"
                  size="small"
                  classes={{ grouped: classes.toggleButtonSmall }}
                >
                  <ToggleButton value="rectangle" aria-label="add a rectangle">
                    <RectangleIcon />
                  </ToggleButton>
                  <ToggleButton value="ellipse" aria-label="add a circle">
                    <CircleIcon />
                  </ToggleButton>
                  <ToggleButton value="polygon" aria-label="add a polygon">
                    <PolygonIcon />
                  </ToggleButton>
                  <ToggleButton value="freehand" aria-label="free hand polygon">
                    <GestureIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Paper>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Style</Typography>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup
                className={classes.grouped}
                aria-label="style selection"
                size="small"
                classes={{ grouped: classes.toggleButtonSmall }}
              >
                <ToggleButton
                  value="strokeColor"
                  aria-label="select color"
                  onClick={this.openChooseColor}
                >
                  <StrokeColorIcon style={{ fill: strokeColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="strokeColor"
                  aria-label="select line weight"
                  onClick={this.openChooseLineWeight}
                >
                  <LineWeightIcon />
                  <ArrowDropDownIcon />
                </ToggleButton>
                <ToggleButton
                  value="fillColor"
                  aria-label="select color"
                  onClick={this.openChooseColor}
                >
                  <FormatColorFillIcon style={{ fill: fillColor }} />
                  <ArrowDropDownIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              <Divider
                flexItem
                orientation="vertical"
                className={classes.divider}
              />
              {
                /* close / open polygon mode only for freehand drawing mode. */
                activeTool === "freehand" ? (
                  <ToggleButtonGroup
                    size="small"
                    value={closedMode}
                    onChange={this.changeClosedMode}
                  >
                    <ToggleButton value="closed">
                      <ClosedPolygonIcon />
                    </ToggleButton>
                    <ToggleButton value="open">
                      <OpenPolygonIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                ) : null
              }
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Conceptual Level</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                {/* <InputLabel id="demo-simple-select-autowidth-label">
                Conceptual Level
              </InputLabel> */}
                <Select
                  labelId="demo-simple-select-autowidth-label"
                  id="demo-simple-select-autowidth"
                  value={this.state.conceptualLevel}
                  onChange={this.handleChange}
                  autoWidth
                  label="Conceptual Level"
                >
                  <MenuItem value={"Work"}>Work</MenuItem>
                  <MenuItem value={"Expression"}>Expression</MenuItem>
                  <MenuItem value={"Manifestation"}>Manifestation</MenuItem>
                  <MenuItem value={"Item"}>Item</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider
            flexItem
            orientation="horizontal"
            className={classes.divider}
          />
          <Grid container>
            <Grid item xs={12}>
              {/* <Typography variant="overline">Anchor</Typography> */}
              <Autocomplete
                freeSolo
                size="small"
                value={anchorValue}
                onChange={this.handleAnchorChange}
                options={anchorOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Create Anchor"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />
            <Grid item xs={12}>
              {/* <Typography variant="overline">Anchor</Typography> */}
              <Autocomplete
                freeSolo
                size="small"
                value={entityValue}
                onChange={this.handleEntityChange}
                options={entityOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Referenced Entity"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />
            <Grid item xs={12}>
              {/* <Typography variant="overline">Anchor</Typography> */}
              <Autocomplete
                freeSolo
                size="small"
                value={criterionValue}
                onChange={this.handleCriterionChange}
                options={criterionOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Interpretative Criterion"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />
            <Grid item xs={12}>
              {/* <Typography variant="overline">Anchor</Typography> */}
              <Autocomplete
                freeSolo
                size="small"
                value={authorValue}
                onChange={this.handleAuthorChange}
                options={authorOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    label="Editor"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Divider
              flexItem
              orientation="horizontal"
              className={classes.divider}
            />
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="overline">Content</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextEditor
                key={textEditorStateBustingKey}
                annoHtml={annoBody}
                updateAnnotationBody={this.updateBody}
              />
            </Grid>
          </Grid>

          <Button onClick={closeCompanionWindow}>Cancel</Button>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </form>
        <Popover
          open={lineWeightPopoverOpen}
          anchorEl={popoverLineWeightAnchorEl}
        >
          <Paper>
            <ClickAwayListener onClickAway={this.handleCloseLineWeight}>
              <MenuList autoFocus role="listbox">
                {[1, 3, 5, 10, 50].map((option, index) => (
                  <MenuItem
                    key={option}
                    onClick={this.handleLineWeightSelect}
                    value={option}
                    selected={option == strokeWidth}
                    role="option"
                    aria-selected={option == strokeWidth}
                  >
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>
        <Popover
          open={colorPopoverOpen}
          anchorEl={popoverAnchorEl}
          onClose={this.closeChooseColor}
        >
          <SketchPicker
            // eslint-disable-next-line react/destructuring-assignment
            color={this.state[currentColorType] || {}}
            onChangeComplete={this.updateStrokeColor}
          />
        </Popover>
      </CompanionWindow>
    );
  }
}

/** */
const styles = (theme) => ({
  divider: {
    margin: theme.spacing(1, 0.5),
  },
  grouped: {
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    border: "none",
    margin: theme.spacing(0.5),
  },
  paper: {
    display: "flex",
    flexWrap: "wrap",
  },
  toggleButtonSmall: {
    // Custom class name for targeting ToggleButtons specifically
    padding: 1.2,
    fontSize: "0.8125rem",
  },
  toggleButton: {
    // Custom class name for targeting ToggleButtons specifically
    padding: 1.2,
    fontSize: "0.8125rem",
  },
  section: {
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
});

AnnotationCreation.propTypes = {
  annotation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number })
  ),
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  closeCompanionWindow: PropTypes.func,
  config: PropTypes.shape({
    annotation: PropTypes.shape({
      adapter: PropTypes.func,
      defaults: PropTypes.objectOf(
        PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.func,
          PropTypes.number,
          PropTypes.string,
        ])
      ),
    }),
  }).isRequired,
  id: PropTypes.string.isRequired,
  receiveAnnotation: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationCreation.defaultProps = {
  annotation: null,
  canvases: [],
  closeCompanionWindow: () => {},
};

export default withStyles(styles)(AnnotationCreation);
